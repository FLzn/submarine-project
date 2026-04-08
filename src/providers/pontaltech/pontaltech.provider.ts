import axios from 'axios';
import { ISmsProvider, SendSmsInput, SendSmsResult } from '../sms-provider.interface';

export class PontaltechProvider implements ISmsProvider {
  constructor(private readonly endpoint: string) {}

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    const response = await axios.post(
      this.endpoint,
      {
        urlCallback: `${process.env.APP_URL}/sms/callback`,
        messages: [
          {
            to: String(input.phoneNumber),
            message: input.message,
            account: input.account,
            urlCallback: `${process.env.APP_URL}/sms/callback`,
            reference: input.reference,
          },
        ],
      },
      {
        auth: {
          username: String(process.env.SMS_USER),
          password: String(process.env.SMS_PASSWORD),
        },
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const result = response.data[0];
    return {
      externalId: result.id,
      status: result.status,
      description: result.statusDescription,
    };
  }
}
