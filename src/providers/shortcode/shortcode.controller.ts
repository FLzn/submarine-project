import { Body, Controller, Logger, Post } from '@nestjs/common';
import { SmsLogsService } from '../../sms-logs/sms-logs.service';
import { SmsRepliesService } from '../../sms-replies/sms-replies.service';

// Mapa id_status da Shortcode para status interno
const STATUS_MAP: Record<number, number> = {
  1: 1, // em trânsito
  2: 2, // entregue sem confirmação
  3: 3, // entregue com confirmação
  4: 4, // celular indisponível
  6: 6, // recusado pela operadora
};

@Controller('webhook/shortcode')
export class ShortcodeController {
  private readonly logger = new Logger(ShortcodeController.name);

  constructor(
    private readonly smsLogsService: SmsLogsService,
    private readonly smsRepliesService: SmsRepliesService,
  ) {}

  @Post('dlr')
  async dlr(@Body() payload: Record<string, any>) {
    const dlrs: any[] = payload.dlrs ?? [];
    this.logger.log(`DLR recebido: ${dlrs.length} registros`);

    const references = dlrs.map((d) => d.external_id).filter(Boolean);
    const logIdMap = await this.smsLogsService.findLogIdsByReferences(references);

    for (const d of dlrs) {
      const logId = logIdMap.get(d.external_id);
      if (!logId) {
        this.logger.warn(`DLR sem log correspondente: external_id=${d.external_id}`);
        continue;
      }
      await this.smsLogsService.updateById(logId, {
        status: Number(STATUS_MAP[d.id_status] ?? d.id_status),
        status_description: d.status,
      });
    }

    return { received: true };
  }

  @Post('mo')
  async mo(@Body() payload: Record<string, any>) {
    const mos: any[] = payload.mos ?? [];
    this.logger.log(`MO recebido: ${mos.length} registros`);

    const references = mos.map((m) => m.external_id).filter(Boolean);
    const logIdMap = await this.smsLogsService.findLogIdsByReferences(references);

    // Adapta campos do MO da Shortcode para o formato esperado por createFromCallback
    const adapted = mos.map((m) => ({
      messageId: undefined,
      reference: m.external_id ?? undefined,
      message: m.message,
      from: m.number,
      received: m.date,
    }));

    await this.smsRepliesService.createFromCallback(adapted, logIdMap);

    return { received: true };
  }
}
