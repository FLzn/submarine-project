import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SmsLog } from './sms-log.entity';

@Injectable()
export class SmsLogsService {
  constructor(
    @InjectRepository(SmsLog)
    private readonly repo: Repository<SmsLog>,
  ) {}

  create(data: Partial<SmsLog>) {
    return this.repo.save(this.repo.create(data));
  }

  private buildWhere(filters: {
    startDate?: string;
    endDate?: string;
    campanhaId?: number;
    clienteId?: number;
    status?: number;
  }) {
    const where: any = {};
    if (filters.startDate && filters.endDate) {
      where.sent_at = Between(
        new Date(filters.startDate),
        new Date(filters.endDate),
      );
    }
    if (filters.campanhaId) where.campanha_id = filters.campanhaId;
    if (filters.status !== undefined) where.status = filters.status;
    return where;
  }

  async findAll(
    filters: {
      startDate?: string;
      endDate?: string;
      campanhaId?: number;
      clienteId?: number;
      status?: number;
    },
    page = 1,
    limit = 50,
  ) {
    const where = this.buildWhere(filters);
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['campanha', 'campanha.cliente'],
      order: { sent_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getStats(filters: {
    startDate?: string;
    endDate?: string;
    campanhaId?: number;
    clienteId?: number;
  }) {
    const qb = this.repo
      .createQueryBuilder('log')
      .leftJoin('log.campanha', 'campanha')
      .leftJoin('campanha.cliente', 'cliente')
      .select('COUNT(log.id)', 'total')
      .addSelect(
        'SUM(CASE WHEN log.status = 0 THEN 1 ELSE 0 END)',
        'total_success',
      )
      .addSelect(
        'SUM(CASE WHEN log.status != 0 THEN 1 ELSE 0 END)',
        'total_error',
      )
      .addSelect(
        'SUM(CASE WHEN log.status = 0 THEN CAST(campanha.valor_sms AS NUMERIC) ELSE 0 END)',
        'valor_total',
      );

    if (filters.startDate && filters.endDate) {
      qb.andWhere('log.sent_at BETWEEN :start AND :end', {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate),
      });
    }
    if (filters.campanhaId) {
      qb.andWhere('log.campanha_id = :campanhaId', {
        campanhaId: filters.campanhaId,
      });
    }
    if (filters.clienteId) {
      qb.andWhere('cliente.id = :clienteId', { clienteId: filters.clienteId });
    }

    const raw = await qb.getRawOne();
    return {
      total: Number(raw.total),
      total_success: Number(raw.total_success),
      total_error: Number(raw.total_error),
      valor_total: Number(raw.valor_total ?? 0),
    };
  }
}
