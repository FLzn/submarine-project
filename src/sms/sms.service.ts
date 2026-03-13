import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OperadorasService } from '../operadoras/operadoras.service';
import { CampanhasService } from '../campanhas/campanhas.service';
import { SmsLogsService } from '../sms-logs/sms-logs.service';
import { SmsRepliesService } from '../sms-replies/sms-replies.service';

export interface SingleSmsPayload {
  phoneNumber: string;
  message: string;
  token: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly operadorasService: OperadorasService,
    private readonly campanhasService: CampanhasService,
    private readonly smsLogsService: SmsLogsService,
    private readonly smsRepliesService: SmsRepliesService,
  ) {}

  async sendSingle(payload: SingleSmsPayload) {
    try {
      const [operadora, campanha] = await Promise.all([
        this.operadorasService.findActive(),
        this.campanhasService.findByToken(payload.token),
      ]);

      const response = await axios.post(
        operadora.endpoint_sms,
        {
          urlCallback: `${process.env.APP_URL}/sms/callback`,
          messages: [
            {
              to: String(payload.phoneNumber),
              message: payload.message,
              account: campanha.cliente.code,
              urlCallback: `${process.env.APP_URL}/sms/callback`,
            },
          ],
        },
        {
          auth: {
            username: String(process.env.SMS_USER),
            password: String(process.env.SMS_PASSWORD),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data[0];

      await this.smsLogsService.create({
        campanha_id: campanha.id,
        phone_number: payload.phoneNumber,
        message: payload.message,
        status: result.status,
        status_description: result.statusDescription,
        pontal_id: result.id,
      });

      return result;
    } catch (error) {
      // NotFoundException (token inválido, operadora inativa) e erros da Pontaltech
      // são relançados para o NestJS retornar o HTTP status correto
      throw error;
    }
  }

  async handleCallback(payload: Record<string, any>) {
    this.logger.log(`callback recebido: ${JSON.stringify(payload)}`);

    if (payload.type === 'api_reply') {
      const replies: any[] = payload.replies ?? [];

      // Busca os sms_log_ids correspondentes aos messageIds recebidos
      const messageIds = replies
        .map((r) => r.messageId)
        .filter(Boolean);

      const logIdMap = await this.smsLogsService.findLogIdsByPontalIds(messageIds);

      await this.smsRepliesService.createFromCallback(replies, logIdMap);
    } else {
      // DLR — atualiza status de entrega
      try {
        await this.smsLogsService.updateByPontalId(payload.id, {
          status: Number(payload.status),
          status_description: payload.statusDescription,
        });
      } catch (err) {
        this.logger.warn(`não foi possível atualizar log: ${err?.message} | pontal_id: ${payload.id}`);
      }
    }

    return { received: true };
  }
}
