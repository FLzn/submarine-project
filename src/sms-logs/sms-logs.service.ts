import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsLog } from './sms-log.entity';

type Filters = {
  startDate?: string;
  endDate?: string;
  campanhaId?: number;
  campanhaName?: string;
  clienteId?: number;
  clienteName?: string;
  status?: number;
};

// Códigos que indicam entrega confirmada
const SUCCESS_STATUSES = [3, 5];
// Códigos que indicam pendente/em trânsito
const PENDING_STATUSES = [0, 1, 2, 99];

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

@Injectable()
export class SmsLogsService {
  constructor(
    @InjectRepository(SmsLog)
    private readonly repo: Repository<SmsLog>,
  ) {}

  create(data: Partial<SmsLog>) {
    return this.repo.save(this.repo.create(data));
  }

  async findLogIdsByPontalIds(pontalIds: string[]): Promise<Map<string, number>> {
    if (!pontalIds.length) return new Map();
    const logs = await this.repo
      .createQueryBuilder('log')
      .select(['log.id', 'log.pontal_id'])
      .where('log.pontal_id IN (:...pontalIds)', { pontalIds })
      .getMany();
    return new Map(logs.map((l) => [l.pontal_id, l.id]));
  }

  async updateByPontalId(
    pontalId: string,
    data: { status: number; status_description: string },
  ) {
    const log = await this.repo.findOneBy({ pontal_id: pontalId });
    if (!log) throw new NotFoundException(`SMS log ${pontalId} não encontrado`);
    await this.repo.update(log.id, data);
  }

  private applyFilters(qb: any, filters: Filters) {
    const start = parseDate(filters.startDate);
    const end = parseDate(filters.endDate);
    if (start && end) {
      qb.andWhere('log.sent_at BETWEEN :start AND :end', { start, end });
    }
    if (filters.campanhaId) {
      qb.andWhere('log.campanha_id = :campanhaId', {
        campanhaId: filters.campanhaId,
      });
    }
    if (filters.campanhaName) {
      qb.andWhere('campanha.descricao ILIKE :campanhaName', {
        campanhaName: `%${filters.campanhaName}%`,
      });
    }
    if (filters.clienteId) {
      qb.andWhere('cliente.id = :clienteId', { clienteId: filters.clienteId });
    }
    if (filters.clienteName) {
      qb.andWhere('cliente.nome ILIKE :clienteName', {
        clienteName: `%${filters.clienteName}%`,
      });
    }
    if (filters.status !== undefined) {
      qb.andWhere('log.status = :status', { status: filters.status });
    }
  }

  async findAll(filters: Filters, page = 1, limit = 50) {
    const qb = this.repo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.campanha', 'campanha')
      .leftJoinAndSelect('campanha.cliente', 'cliente')
      .orderBy('log.sent_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    this.applyFilters(qb, filters);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getStats(filters: Filters) {
    const successList = SUCCESS_STATUSES.join(',');
    const pendingList = PENDING_STATUSES.join(',');

    const qb = this.repo
      .createQueryBuilder('log')
      .leftJoin('log.campanha', 'campanha')
      .leftJoin('campanha.cliente', 'cliente')
      .select('COUNT(log.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN log.status IN (${successList}) THEN 1 ELSE 0 END)`,
        'total_delivered',
      )
      .addSelect(
        `SUM(CASE WHEN log.status IN (${pendingList}) THEN 1 ELSE 0 END)`,
        'total_pending',
      )
      .addSelect(
        `SUM(CASE WHEN log.status NOT IN (${successList},${pendingList}) THEN 1 ELSE 0 END)`,
        'total_error',
      )
      .addSelect(
        `SUM(CASE WHEN log.status IN (${successList}) THEN CAST(campanha.valor_sms AS NUMERIC) ELSE 0 END)`,
        'valor_total',
      );

    this.applyFilters(qb, filters);

    const raw = await qb.getRawOne();
    return {
      total: Number(raw?.total ?? 0),
      total_delivered: Number(raw?.total_delivered ?? 0),
      total_pending: Number(raw?.total_pending ?? 0),
      total_error: Number(raw?.total_error ?? 0),
      valor_total: Number(raw?.valor_total ?? 0),
    };
  }
}
