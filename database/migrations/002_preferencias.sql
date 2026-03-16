-- Migration 002: tabela de preferências do sistema
-- Executar após 001_initial.sql

CREATE TABLE IF NOT EXISTS preferencias (
  id                      SERIAL PRIMARY KEY,
  cleanup_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  cleanup_interval_months INTEGER NOT NULL DEFAULT 3,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insere a linha singleton de configuração (caso não exista)
INSERT INTO preferencias (id, cleanup_enabled, cleanup_interval_months)
VALUES (1, FALSE, 3)
ON CONFLICT (id) DO NOTHING;
