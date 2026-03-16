/**
 * Seed de dados iniciais — Submarine SMS Backend
 *
 * Uso:
 *   npm run seed
 *
 * Pré-requisito: banco criado e migration 001_initial.sql já executada.
 *
 * Edite as constantes abaixo com os dados reais antes de rodar em produção.
 */

import 'dotenv/config';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

// ─── Dados para popular ──────────────────────────────────────────────────────

const ADMIN_USER = {
  username: 'admin',
  email: 'admin@submarine.com',
  password: 'admin123', // será hasheado com bcrypt
};

const OPERADORA = {
  nome: 'Pontaltech',
  endpoint_sms: 'https://api.pontaltech.com.br/v3/sms',
  status: 'on',
};

// Substitua pelos dados reais do seu cliente
const CLIENTE = {
  cnpj_cpf: '00.000.000/0001-00',
  nome: 'Cliente Demo',
  code: 1,        // código da conta no provedor SMS
  status: 'on',
};

// Substitua pelo token real usado nas integrações
const CAMPANHA = {
  descricao: 'Campanha Demo',
  valor_sms: '0.1500',
  token: 'demo-token-substitua-pelo-real',
  status: 'on',
};

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  await client.connect();
  console.log('Conectado ao banco de dados.');

  try {
    // Users
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
    await client.query(
      `INSERT INTO users (username, email, password, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [ADMIN_USER.username, ADMIN_USER.email, hashedPassword, 'on'],
    );
    console.log(`Usuário '${ADMIN_USER.username}' criado (senha: ${ADMIN_USER.password})`);

    // Operadora
    const opRes = await client.query(
      `INSERT INTO operadoras (nome, endpoint_sms, status)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [OPERADORA.nome, OPERADORA.endpoint_sms, OPERADORA.status],
    );
    const operadoraId = opRes.rows[0]?.id;
    console.log(`Operadora '${OPERADORA.nome}' ${operadoraId ? 'criada' : 'já existia'}`);

    // Cliente
    const clRes = await client.query(
      `INSERT INTO clientes (cnpj_cpf, nome, code, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cnpj_cpf) DO NOTHING
       RETURNING id`,
      [CLIENTE.cnpj_cpf, CLIENTE.nome, CLIENTE.code, CLIENTE.status],
    );
    const clienteId = clRes.rows[0]?.id
      ?? (await client.query('SELECT id FROM clientes WHERE cnpj_cpf = $1', [CLIENTE.cnpj_cpf])).rows[0]?.id;
    console.log(`Cliente '${CLIENTE.nome}' ${clRes.rows[0] ? 'criado' : 'já existia'} (id: ${clienteId})`);

    // Campanha
    await client.query(
      `INSERT INTO campanhas (cliente_id, descricao, valor_sms, token, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (token) DO NOTHING`,
      [clienteId, CAMPANHA.descricao, CAMPANHA.valor_sms, CAMPANHA.token, CAMPANHA.status],
    );
    console.log(`Campanha '${CAMPANHA.descricao}' criada/verificada`);

    console.log('\nSeed concluído com sucesso!');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});
