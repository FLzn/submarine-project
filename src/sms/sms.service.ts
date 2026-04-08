import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OperadorasService } from '../operadoras/operadoras.service';
import { CampanhasService } from '../campanhas/campanhas.service';
import { SmsLogsService } from '../sms-logs/sms-logs.service';
import { SmsRepliesService } from '../sms-replies/sms-replies.service';
import { Operadora } from '../operadoras/operadora.entity';
import { ISmsProvider } from '../providers/sms-provider.interface';
import { PontaltechProvider } from '../providers/pontaltech/pontaltech.provider';
import { ShortcodeProvider } from '../providers/shortcode/shortcode.provider';

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

  private resolveProvider(operadora: Operadora): ISmsProvider {
    if (operadora.nome?.toLowerCase().includes('shortcode')) {
      return new ShortcodeProvider();
    }
    return new PontaltechProvider(operadora.endpoint_sms);
  }

  async sendSingle(payload: SingleSmsPayload) {
    const [operadora, campanha] = await Promise.all([
      this.operadorasService.findActive(),
      this.campanhasService.findByToken(payload.token),
    ]);

    const reference = randomUUID();
    const provider = this.resolveProvider(operadora);

    const result = await provider.send({
      phoneNumber: payload.phoneNumber,
      message: payload.message,
      reference,
      account: campanha.cliente.code,
    });

    await this.smsLogsService.create({
      campanha_id: campanha.id,
      phone_number: payload.phoneNumber,
      message: payload.message,
      status: result.status as any,
      status_description: result.description,
      pontal_id: result.externalId,
      reference,
    });

    return result;
  }

  async handleCallback(payload: Record<string, any>) {
    this.logger.log(`callback recebido: ${JSON.stringify(payload)}`);

    if (payload.type === 'api_reply') {
      const replies: any[] = payload.replies ?? [];

      const references = replies.map((r) => r.reference).filter(Boolean);
      const logIdMap = await this.smsLogsService.findLogIdsByReferences(references);

      await this.smsRepliesService.createFromCallback(replies, logIdMap);
    } else {
      // DLR Pontaltech — atualiza status de entrega
      try {
        await this.smsLogsService.updateByPontalId(payload.id, {
          status: Number(payload.status),
          status_description: payload.statusDescription,
        });
      } catch (err: any) {
        this.logger.warn(`não foi possível atualizar log: ${err?.message} | pontal_id: ${payload.id}`);
      }
    }

    return { received: true };
  }
}
