import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RelatorioSmsQueryDto } from './relatorio-sms.dto';
import { RelatoriosService } from './relatorios.service';
import { PdfService } from './pdf.service';
import { buildRelatorioSmsHtml } from './relatorio-sms.template';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(
    private service: RelatoriosService,
    private pdfService: PdfService,
  ) {}

  @Get('sms')
  getSms(@Query() query: RelatorioSmsQueryDto) {
    return this.service.getSmsReport(query.startDate, query.endDate);
  }

  @Get('sms/pdf')
  async getSmsPdf(@Query() query: RelatorioSmsQueryDto, @Res() res: Response) {
    const report = await this.service.getSmsReport(query.startDate, query.endDate);
    const html = buildRelatorioSmsHtml(report);
    const pdf = await this.pdfService.generateFromHtml(html);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="relatorio-sms-${query.startDate}-${query.endDate}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }
}
