interface ReportData {
  periodo: { start: string; end: string };
  totais: {
    total: number;
    total_delivered: number;
    total_pending: number;
    total_error: number;
    valor_total: number;
    taxa_entrega: number;
  };
  por_cliente: {
    cliente_id: number;
    cliente_nome: string;
    total: number;
    total_delivered: number;
    total_pending: number;
    total_error: number;
    valor_total: number;
    taxa_entrega: number;
  }[];
  evolucao_diaria: {
    data: string;
    total: number;
    total_delivered: number;
    total_error: number;
  }[];
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function generateBarChart(
  data: { data: string; total: number; total_delivered: number; total_error: number }[],
): string {
  if (!data.length) {
    return '<p style="color:#9ca3af;text-align:center;padding:40px 0">Sem dados no período</p>';
  }

  const W = 680;
  const H = 200;
  const PL = 45;
  const PR = 15;
  const PT = 10;
  const PB = 35;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const slotW = innerW / data.length;
  const bw = Math.min(Math.max(slotW * 0.22, 4), 14);
  const gap = bw * 0.4;

  const yLines = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const y = PT + innerH - f * innerH;
      const val = Math.round(maxVal * f);
      return `
        <line x1="${PL}" y1="${y}" x2="${PL + innerW}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>
        <text x="${PL - 6}" y="${y + 4}" text-anchor="end" font-size="9" fill="#6b7280">${val}</text>`;
    })
    .join('');

  const bars = data
    .map((d, i) => {
      const cx = PL + i * slotW + slotW / 2;
      const base = PT + innerH;
      const th = (d.total / maxVal) * innerH;
      const dh = (d.total_delivered / maxVal) * innerH;
      const eh = (d.total_error / maxVal) * innerH;

      const x1 = cx - bw - gap;
      const x2 = cx - bw / 2;
      const x3 = cx + gap;

      const label = d.data
        ? (() => {
            const [, m, day] = String(d.data).slice(0, 10).split('-');
            return `${day}/${m}`;
          })()
        : '';

      return `
        <rect x="${x1}" y="${base - th}" width="${bw}" height="${Math.max(th, 0)}" fill="#93c5fd" rx="2"/>
        <rect x="${x2}" y="${base - dh}" width="${bw}" height="${Math.max(dh, 0)}" fill="#4ade80" rx="2"/>
        <rect x="${x3}" y="${base - eh}" width="${bw}" height="${Math.max(eh, 0)}" fill="#f87171" rx="2"/>
        <text x="${cx}" y="${base + 18}" text-anchor="middle" font-size="9" fill="#6b7280">${label}</text>`;
    })
    .join('');

  const legend = `
    <rect x="${PL}" y="${H - 10}" width="10" height="10" fill="#93c5fd" rx="2"/>
    <text x="${PL + 14}" y="${H - 1}" font-size="10" fill="#374151">Total</text>
    <rect x="${PL + 60}" y="${H - 10}" width="10" height="10" fill="#4ade80" rx="2"/>
    <text x="${PL + 74}" y="${H - 1}" font-size="10" fill="#374151">Entregues</text>
    <rect x="${PL + 150}" y="${H - 10}" width="10" height="10" fill="#f87171" rx="2"/>
    <text x="${PL + 164}" y="${H - 1}" font-size="10" fill="#374151">Erros</text>`;

  return `
    <svg width="${W}" height="${H + 20}" xmlns="http://www.w3.org/2000/svg">
      ${yLines}
      <line x1="${PL}" y1="${PT}" x2="${PL}" y2="${PT + innerH}" stroke="#d1d5db" stroke-width="1"/>
      <line x1="${PL}" y1="${PT + innerH}" x2="${PL + innerW}" y2="${PT + innerH}" stroke="#d1d5db" stroke-width="1"/>
      ${bars}
      ${legend}
    </svg>`;
}

function progressBar(pct: number): string {
  const color = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return `
    <div style="display:flex;align-items:center;gap:6px">
      <div style="flex:1;background:#e5e7eb;border-radius:4px;height:8px;min-width:60px">
        <div style="width:${pct}%;background:${color};height:8px;border-radius:4px"></div>
      </div>
      <span style="font-size:12px;font-weight:600;color:${color};width:38px">${pct}%</span>
    </div>`;
}

export function buildRelatorioSmsHtml(data: ReportData): string {
  const { periodo, totais, por_cliente, evolucao_diaria } = data;
  const geradoEm = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const clienteRows = por_cliente
    .map(
      (c) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:500;color:#111827">${c.cliente_nome}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151">${c.total.toLocaleString('pt-BR')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#16a34a;font-weight:500">${c.total_delivered.toLocaleString('pt-BR')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#d97706">${c.total_pending.toLocaleString('pt-BR')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#dc2626">${c.total_error.toLocaleString('pt-BR')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;color:#374151;font-weight:500">${formatCurrency(c.valor_total)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;min-width:140px">${progressBar(c.taxa_entrega)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1f2937; font-size: 13px; }
    .page { padding: 36px 40px; max-width: 800px; margin: 0 auto; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .logo-img { max-width: 160px; max-height: 60px; object-fit: contain; }
    .header-info { text-align: right; }
    .header-title { font-size: 20px; font-weight: 700; color: #1e3a5f; margin-bottom: 4px; }
    .header-period { font-size: 13px; color: #6b7280; }
    .header-generated { font-size: 11px; color: #9ca3af; margin-top: 2px; }

    /* Divider */
    .divider { height: 3px; background: linear-gradient(90deg, #1e3a5f, #3b82f6, #e0e7ff); border-radius: 2px; margin-bottom: 24px; }

    /* Section title */
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 12px; }

    /* KPI cards */
    .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 28px; }
    .card { background: #fff; border-radius: 10px; padding: 14px 10px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.07); border-top: 3px solid #e5e7eb; }
    .card.blue  { border-top-color: #3b82f6; }
    .card.green { border-top-color: #16a34a; }
    .card.amber { border-top-color: #d97706; }
    .card.red   { border-top-color: #dc2626; }
    .card.teal  { border-top-color: #0d9488; }
    .card-value { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .card-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Taxa badge */
    .taxa-row { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 28px; margin-top: -20px; }
    .taxa-badge { background: #dcfce7; color: #16a34a; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 20px; }

    /* Chart section */
    .chart-box { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); margin-bottom: 28px; }

    /* Table */
    .table-box { background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); overflow: hidden; margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #1e3a5f; }
    thead th { padding: 11px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #e2e8f0; }
    thead th:not(:first-child) { text-align: center; }
    thead th:nth-child(6) { text-align: right; }
    tbody tr:hover { background: #f9fafb; }

    /* Footer */
    .footer { text-align: center; font-size: 10px; color: #d1d5db; padding-top: 8px; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <img class="logo-img" src="data:image/jpeg;base64,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" alt="Logo" />
    <div class="header-info">
      <div class="header-title">Relatório de SMS Enviados</div>
      <div class="header-period">Período: ${formatDate(periodo.start)} a ${formatDate(periodo.end)}</div>
      <div class="header-generated">Gerado em ${geradoEm}</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- KPI Cards -->
  <div class="section-title">Resumo do Período</div>
  <div class="cards">
    <div class="card blue">
      <div class="card-value">${totais.total.toLocaleString('pt-BR')}</div>
      <div class="card-label">Enviados</div>
    </div>
    <div class="card green">
      <div class="card-value">${totais.total_delivered.toLocaleString('pt-BR')}</div>
      <div class="card-label">Entregues</div>
    </div>
    <div class="card amber">
      <div class="card-value">${totais.total_pending.toLocaleString('pt-BR')}</div>
      <div class="card-label">Pendentes</div>
    </div>
    <div class="card red">
      <div class="card-value">${totais.total_error.toLocaleString('pt-BR')}</div>
      <div class="card-label">Erros</div>
    </div>
    <div class="card teal">
      <div class="card-value" style="font-size:15px">${formatCurrency(totais.valor_total)}</div>
      <div class="card-label">Valor Total</div>
    </div>
  </div>

  <div class="taxa-row">
    <span style="font-size:12px;color:#6b7280">Taxa de entrega geral:</span>
    <span class="taxa-badge">${totais.taxa_entrega}%</span>
  </div>

  <!-- Daily Evolution Chart -->
  <div class="section-title">Evolução Diária</div>
  <div class="chart-box">
    ${generateBarChart(evolucao_diaria)}
  </div>

  <!-- Per Client Table -->
  <div class="section-title">Breakdown por Cliente</div>
  <div class="table-box">
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Total</th>
          <th>Entregues</th>
          <th>Pendentes</th>
          <th>Erros</th>
          <th>Valor</th>
          <th>Taxa de Entrega</th>
        </tr>
      </thead>
      <tbody>
        ${clienteRows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#9ca3af">Nenhum dado encontrado</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="footer">submarine-project &bull; Relatório gerado automaticamente</div>
</div>
</body>
</html>`;
}
