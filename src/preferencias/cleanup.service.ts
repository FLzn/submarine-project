import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { SmsLog } from '../sms-logs/sms-log.entity';
import { SmsReply } from '../sms-replies/sms-reply.entity';
import { PreferenciasService } from './preferencias.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(SmsLog)
    private smsLogRepo: Repository<SmsLog>,
    @InjectRepository(SmsReply)
    private smsReplyRepo: Repository<SmsReply>,
    private prefService: PreferenciasService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runCleanup(): Promise<void> {
    const pref = await this.prefService.get();

    if (!pref.cleanup_enabled) return;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - pref.cleanup_interval_months);

    const logsToDelete = await this.smsLogRepo.find({
      where: { sent_at: LessThan(cutoff) },
      select: ['id'],
    });

    if (logsToDelete.length === 0) {
      this.logger.log('Cleanup: nenhum SMS antigo encontrado.');
      return;
    }

    const ids = logsToDelete.map((l) => l.id);

    await this.smsReplyRepo
      .createQueryBuilder()
      .delete()
      .where('sms_log_id IN (:...ids)', { ids })
      .execute();

    const result = await this.smsLogRepo
      .createQueryBuilder()
      .delete()
      .where('sent_at < :cutoff', { cutoff })
      .execute();

    this.logger.log(
      `Cleanup: ${result.affected} SMS removidos (anteriores a ${cutoff.toISOString()}).`,
    );
  }
}
