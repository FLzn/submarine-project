import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { RelatoriosService } from './relatorios.service';
import { PdfService } from './pdf.service';
import { MailService } from '../mail/mail.service';
import { buildRelatorioSmsHtml } from './relatorio-sms.template';

@Injectable()
export class RelatorioAgendadoService {
  private readonly logger = new Logger(RelatorioAgendadoService.name);

  constructor(
    private relatoriosService: RelatoriosService,
    private pdfService: PdfService,
    private mailService: MailService,
    private config: ConfigService,
  ) {}

  @Cron('0 8 1 * *') // Todo dia 1 de cada mês às 08:00
  async enviarRelatorioMensal() {
    const now = new Date();
    const primeiroDiaMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);

    const startDate = primeiroDiaMesAnterior.toISOString().slice(0, 10);
    const endDate = ultimoDiaMesAnterior.toISOString().slice(0, 10);

    const mesAno = primeiroDiaMesAnterior.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    });

    this.logger.log(`Gerando relatório mensal: ${startDate} → ${endDate}`);

    try {
      const report = await this.relatoriosService.getSmsReport(startDate, endDate);
      const html = buildRelatorioSmsHtml(report);
      const pdf = await this.pdfService.generateFromHtml(html);

      const destinatarios = this.config
        .get<string>('MAIL_TO', '')
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      await this.mailService.sendPdfReport(
        destinatarios,
        `Relatório SMS — ${mesAno}`,
        `<p>Olá,</p><p>Segue em anexo o relatório de envios de SMS referente a <strong>${mesAno}</strong>.</p><p>Atenciosamente,<br/>Submarine SMS</p>`,
        pdf,
        `relatorio-sms-${startDate}-${endDate}.pdf`,
      );

      this.logger.log(`Relatório mensal enviado com sucesso (${mesAno})`);
    } catch (err) {
      this.logger.error(`Falha ao enviar relatório mensal (${mesAno})`, err);
    }
  }
}
