import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsLog } from '../sms-logs/sms-log.entity';

const SUCCESS_STATUSES = [3, 5];
const PENDING_STATUSES = [0, 1, 2, 99];
const SUCCESS_LIST = SUCCESS_STATUSES.join(',');
const PENDING_LIST = PENDING_STATUSES.join(',');

function taxaEntrega(total: number, delivered: number): number {
  return total > 0 ? Number(((delivered / total) * 100).toFixed(2)) : 0;
}

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(SmsLog)
    private repo: Repository<SmsLog>,
  ) {}

  async getSmsReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [totaisRaw, porClienteRaw, evolucaoRaw] = await Promise.all([
      this.queryTotais(start, end),
      this.queryPorCliente(start, end),
      this.queryEvolucaoDiaria(start, end),
    ]);

    const total = Number(totaisRaw?.total ?? 0);
    const total_delivered = Number(totaisRaw?.total_delivered ?? 0);

    return {
      periodo: { start: startDate, end: endDate },
      totais: {
        total,
        total_delivered,
        total_pending: Number(totaisRaw?.total_pending ?? 0),
        total_error: Number(totaisRaw?.total_error ?? 0),
        valor_total: Number(totaisRaw?.valor_total ?? 0),
        taxa_entrega: taxaEntrega(total, total_delivered),
      },
      por_cliente: porClienteRaw.map((r) => {
        const t = Number(r.total ?? 0);
        const d = Number(r.total_delivered ?? 0);
        return {
          cliente_id: r.cliente_id,
          cliente_nome: r.cliente_nome,
          total: t,
          total_delivered: d,
          total_pending: Number(r.total_pending ?? 0),
          total_error: Number(r.total_error ?? 0),
          valor_total: Number(r.valor_total ?? 0),
          taxa_entrega: taxaEntrega(t, d),
        };
      }),
      evolucao_diaria: evolucaoRaw.map((r) => ({
        data: r.data,
        total: Number(r.total ?? 0),
        total_delivered: Number(r.total_delivered ?? 0),
        total_error: Number(r.total_error ?? 0),
      })),
    };
  }

  private queryTotais(start: Date, end: Date) {
    return this.repo
      .createQueryBuilder('log')
      .leftJoin('log.campanha', 'campanha')
      .select('COUNT(log.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN log.status IN (${SUCCESS_LIST}) THEN 1 ELSE 0 END)`,
        'total_delivered',
      )
      .addSelect(
        `SUM(CASE WHEN log.status IN (${PENDING_LIST}) THEN 1 ELSE 0 END)`,
        'total_pending',
      )
      .addSelect(
        `SUM(CASE WHEN log.status NOT IN (${SUCCESS_LIST},${PENDING_LIST}) THEN 1 ELSE 0 END)`,
        'total_error',
      )
      .addSelect(
        `SUM(CASE WHEN log.status IN (${SUCCESS_LIST}) THEN CAST(campanha.valor_sms AS NUMERIC) ELSE 0 END)`,
        'valor_total',
      )
      .where('log.sent_at BETWEEN :start AND :end', { start, end })
      .getRawOne();
  }

  private queryPorCliente(start: Date, end: Date) {
    return this.repo
      .createQueryBuilder('log')
      .leftJoin('log.campanha', 'campanha')
      .leftJoin('campanha.cliente', 'cliente')
      .select('cliente.id', 'cliente_id')
      .addSelect('cliente.nome', 'cliente_nome')
      .addSelect('COUNT(log.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN log.status IN (${SUCCESS_LIST}) THEN 1 ELSE 0 END)`,
        'total_delivered',
      )
      .addSelect(
        `SUM(CASE WHEN log.status IN (${PENDING_LIST}) THEN 1 ELSE 0 END)`,
        'total_pending',
      )
      .addSelect(
        `SUM(CASE WHEN log.status NOT IN (${SUCCESS_LIST},${PENDING_LIST}) THEN 1 ELSE 0 END)`,
        'total_error',
      )
      .addSelect(
        `SUM(CASE WHEN log.status IN (${SUCCESS_LIST}) THEN CAST(campanha.valor_sms AS NUMERIC) ELSE 0 END)`,
        'valor_total',
      )
      .where('log.sent_at BETWEEN :start AND :end', { start, end })
      .groupBy('cliente.id')
      .addGroupBy('cliente.nome')
      .orderBy('total', 'DESC')
      .getRawMany();
  }

  private queryEvolucaoDiaria(start: Date, end: Date) {
    const dateExpr = `DATE(log.sent_at AT TIME ZONE 'America/Sao_Paulo')`;
    return this.repo
      .createQueryBuilder('log')
      .select(dateExpr, 'data')
      .addSelect('COUNT(log.id)', 'total')
      .addSelect(
        `SUM(CASE WHEN log.status IN (${SUCCESS_LIST}) THEN 1 ELSE 0 END)`,
        'total_delivered',
      )
      .addSelect(
        `SUM(CASE WHEN log.status NOT IN (${SUCCESS_LIST},${PENDING_LIST}) THEN 1 ELSE 0 END)`,
        'total_error',
      )
      .where('log.sent_at BETWEEN :start AND :end', { start, end })
      .groupBy(dateExpr)
      .orderBy(dateExpr, 'ASC')
      .getRawMany();
  }
}
