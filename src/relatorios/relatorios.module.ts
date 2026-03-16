import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsLog } from '../sms-logs/sms-log.entity';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { PdfService } from './pdf.service';
import { RelatorioAgendadoService } from './relatorio-agendado.service';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog])],
  controllers: [RelatoriosController],
  providers: [RelatoriosService, PdfService, RelatorioAgendadoService, MailService],
  exports: [RelatoriosService, PdfService],
})
export class RelatoriosModule {}
