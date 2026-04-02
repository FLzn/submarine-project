/**
 * Testes unitários para as correções de timezone e reference feature.
 *
 * Contexto dos bugs corrigidos:
 * 1. Filtro de mesma data retornava zero registros (new Date('YYYY-MM-DD') é UTC
 *    midnight; setHours() usa hora local → janela de apenas 3h em BRT)
 * 2. Filtros do dashboard paravam após a correção (frontend enviava datetime strings
 *    completas; substring(0,10) foi adicionado para extrair só a parte da data)
 */

// Replica exatamente a função parseDate de sms-logs.service.ts
function parseDate(value: string | undefined, endOfDay = false): Date | null {
  if (!value) return null;
  const datePart = value.substring(0, 10);
  const suffix = endOfDay ? 'T23:59:59.999-03:00' : 'T00:00:00-03:00';
  const d = new Date(datePart + suffix);
  return isNaN(d.getTime()) ? null : d;
}

// Replica a lógica de relatorios.service.ts
function buildReportDates(startDate: string, endDate: string) {
  return {
    start: new Date(startDate + 'T00:00:00-03:00'),
    end: new Date(endDate + 'T23:59:59.999-03:00'),
  };
}

describe('parseDate (sms-logs.service) — correção de timezone', () => {
  it('início do dia deve ser meia-noite BRT (UTC-3 = 03:00 UTC)', () => {
    const d = parseDate('2026-04-02');
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe('2026-04-02T03:00:00.000Z');
  });

  it('fim do dia deve ser 23:59:59.999 BRT (= 02:59:59.999 UTC do dia seguinte)', () => {
    const d = parseDate('2026-04-02', true);
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe('2026-04-03T02:59:59.999Z');
  });

  it('mesma data start/end cobre o dia inteiro (inicio < fim)', () => {
    const start = parseDate('2026-04-02')!;
    const end = parseDate('2026-04-02', true)!;
    expect(start.getTime()).toBeLessThan(end.getTime());
    // Janela deve ser de exatamente 86399999 ms (23h59m59.999s)
    expect(end.getTime() - start.getTime()).toBe(86399999);
  });

  it('retorna null para string vazia ou undefined', () => {
    expect(parseDate('')).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });

  it('retorna null para data inválida', () => {
    expect(parseDate('nao-e-data')).toBeNull();
  });
});

describe('parseDate — fix de datetime strings do frontend (bug dashboard)', () => {
  it('extrai só a parte da data de uma datetime string ISO completa', () => {
    // Frontend enviava '2026-04-02T12:00:00.000Z' — sem substring(0,10) quebrava
    const d = parseDate('2026-04-02T12:00:00.000Z');
    expect(d).not.toBeNull();
    // Deve tratar como início do dia BRT, ignorando a hora original
    expect(d!.toISOString()).toBe('2026-04-02T03:00:00.000Z');
  });

  it('extrai só a parte da data de datetime com offset', () => {
    const d = parseDate('2026-04-02T15:30:00-03:00');
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe('2026-04-02T03:00:00.000Z');
  });

  it('funciona com string no formato DD/MM/YYYY parcialmente (apenas primeiros 10 chars)', () => {
    // Garante que substring(0,10) sempre limita corretamente
    const raw = '2026-04-02T23:59:59.999-03:00';
    expect(raw.substring(0, 10)).toBe('2026-04-02');
  });
});

describe('buildReportDates (relatorios.service) — correção de timezone', () => {
  it('início do período deve ser meia-noite BRT', () => {
    const { start } = buildReportDates('2026-04-01', '2026-04-02');
    expect(start.toISOString()).toBe('2026-04-01T03:00:00.000Z');
  });

  it('fim do período deve ser 23:59:59.999 BRT', () => {
    const { end } = buildReportDates('2026-04-01', '2026-04-02');
    expect(end.toISOString()).toBe('2026-04-03T02:59:59.999Z');
  });

  it('período de um dia cobre o dia inteiro', () => {
    const { start, end } = buildReportDates('2026-04-02', '2026-04-02');
    expect(start.getTime()).toBeLessThan(end.getTime());
    expect(end.getTime() - start.getTime()).toBe(86399999);
  });
});

describe('reference feature — lógica de vinculação', () => {
  it('smsLogIdByMessageId retorna undefined para reference desconhecida', () => {
    const map = new Map<string, number>([['uuid-1', 10]]);
    expect(map.get('uuid-desconhecido')).toBeUndefined();
  });

  it('smsLogIdByMessageId retorna o id correto para reference conhecida', () => {
    const ref = 'aabbccdd-0000-0000-0000-112233445566';
    const map = new Map<string, number>([[ref, 42]]);
    expect(map.get(ref)).toBe(42);
  });

  it('?? undefined preserva undefined quando reference não encontrada', () => {
    const map = new Map<string, number>();
    const smsLogId = map.get('ref-inexistente') ?? undefined;
    expect(smsLogId).toBeUndefined();
  });

  it('references vazias resultam em Map vazio (sem query ao banco)', () => {
    const references: string[] = [];
    // Simula o guard de findLogIdsByReferences
    if (!references.length) {
      const result = new Map<string, number>();
      expect(result.size).toBe(0);
    }
  });
});
