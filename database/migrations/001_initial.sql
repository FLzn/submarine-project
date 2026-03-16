-- =============================================================
-- Submarine SMS Backend — Migration 001: Schema inicial
-- Executar como o usuário dono do banco (submarine)
-- =============================================================

-- Enums de status (compartilhado entre tabelas)
DO $$ BEGIN
  CREATE TYPE status_enum AS ENUM ('on', 'off');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -------------------------------------------------------------
-- clientes
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id          SERIAL PRIMARY KEY,
  cnpj_cpf    VARCHAR NOT NULL,
  nome        VARCHAR NOT NULL,
  code        INTEGER NOT NULL,
  status      status_enum NOT NULL DEFAULT 'on',
  CONSTRAINT clientes_cnpj_cpf_unique UNIQUE (cnpj_cpf)
);

-- -------------------------------------------------------------
-- campanhas
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campanhas (
  id          SERIAL PRIMARY KEY,
  cliente_id  INTEGER NOT NULL,
  descricao   VARCHAR NOT NULL,
  valor_sms   DECIMAL(10, 4) NOT NULL,
  token       VARCHAR NOT NULL,
  status      status_enum NOT NULL DEFAULT 'on',
  CONSTRAINT campanhas_token_unique UNIQUE (token),
  CONSTRAINT campanhas_cliente_id_fk FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

-- -------------------------------------------------------------
-- operadoras
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operadoras (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR NOT NULL,
  endpoint_sms VARCHAR NOT NULL,
  status       status_enum NOT NULL DEFAULT 'on'
);

-- -------------------------------------------------------------
-- users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id       SERIAL PRIMARY KEY,
  username VARCHAR NOT NULL,
  email    VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  status   status_enum NOT NULL DEFAULT 'on',
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_email_unique    UNIQUE (email)
);

-- -------------------------------------------------------------
-- sms_logs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sms_logs (
  id                 SERIAL PRIMARY KEY,
  campanha_id        INTEGER NOT NULL,
  phone_number       VARCHAR NOT NULL,
  message            TEXT NOT NULL,
  status             INTEGER NOT NULL,
  status_description VARCHAR NOT NULL,
  pontal_id          VARCHAR,
  sent_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sms_logs_campanha_id_fk FOREIGN KEY (campanha_id) REFERENCES campanhas (id)
);

-- -------------------------------------------------------------
-- sms_replies
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sms_replies (
  id           SERIAL PRIMARY KEY,
  sms_log_id   INTEGER,
  message_id   VARCHAR NOT NULL,
  reference    VARCHAR,
  message      TEXT NOT NULL,
  from_number  VARCHAR NOT NULL,
  classify     VARCHAR,
  value        VARCHAR,
  received_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
