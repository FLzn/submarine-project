import axios from 'axios';
import { ISmsProvider, SendSmsInput, SendSmsResult } from '../sms-provider.interface';

export class ShortcodeProvider implements ISmsProvider {
  async send(input: SendSmsInput): Promise<SendSmsResult> {
    const token = process.env.SHORTCODE_TOKEN;
    if (!token) throw new Error('SHORTCODE_TOKEN não configurado');

    const response = await axios.post(
      'https://api.shortcode.com.br/messages',
      [
        {
          external_id: input.reference,
          number: String(input.phoneNumber),
          message: input.message,
        },
      ],
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const item = response.data[0];
    return {
      externalId: item.external_id,
      status: item.status === 'accepted' ? 'accepted' : 'failed',
      description: item.reason,
    };
  }
}
