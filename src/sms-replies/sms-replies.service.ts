import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsReply } from './sms-reply.entity';

@Injectable()
export class SmsRepliesService {
  constructor(
    @InjectRepository(SmsReply)
    private readonly repo: Repository<SmsReply>,
  ) {}

  async createFromCallback(replies: any[], smsLogIdByMessageId: Map<string, number>) {
    const entities = replies.map((r) =>
      this.repo.create({
        message_id: r.messageId,
        sms_log_id: smsLogIdByMessageId.get(r.messageId) ?? undefined,
        reference: r.reference ?? undefined,
        message: r.message,
        from_number: String(r.from),
        classify: r.classify ?? undefined,
        value: r.value != null ? String(r.value) : undefined,
        received_at: r.received ? new Date(r.received) : undefined,
      }),
    );
    return this.repo.save(entities);
  }

  async findAll(
    filters: { startDate?: string; endDate?: string },
    page = 1,
    limit = 50,
  ) {
    const qb = this.repo
      .createQueryBuilder('reply')
      .orderBy('reply.received_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.startDate && filters.endDate) {
      qb.where('reply.received_at BETWEEN :start AND :end', {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate),
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
