import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendPdfReport(to: string[], subject: string, body: string, pdfBuffer: Buffer, filename: string): Promise<void> {
    this.logger.log(`Iniciando envio | Para: ${to.join(', ')} | Assunto: "${subject}" | PDF: ${filename} (${pdfBuffer.length} bytes)`);

    const info = await this.transporter.sendMail({
      from: `"Submarine SMS" <${this.config.get('MAIL_USER')}>`,
      to: to.join(', '),
      subject,
      html: body,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    this.logger.log(`E-mail aceito pelo servidor | MessageId: ${info.messageId} | Response: ${info.response}`);
  }
}
