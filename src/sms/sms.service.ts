import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { OperadorasService } from '../operadoras/operadoras.service';
import { CampanhasService } from '../campanhas/campanhas.service';
import { SmsLogsService } from '../sms-logs/sms-logs.service';

export interface SingleSmsPayload {
  phoneNumber: string;
  message: string;
  token: string;
}

@Injectable()
export class SmsService {
  constructor(
    private readonly operadorasService: OperadorasService,
    private readonly campanhasService: CampanhasService,
    private readonly smsLogsService: SmsLogsService,
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
          messages: [
            {
              to: String(payload.phoneNumber),
              message: payload.message,
              account: campanha.cliente.code,
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
}
