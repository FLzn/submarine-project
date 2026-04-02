-- =============================================================
-- Submarine SMS Backend — Migration 003: reference em sms_logs
-- Permite vincular respostas ao SMS original via campo reference
-- =============================================================

ALTER TABLE sms_logs ADD COLUMN IF NOT EXISTS reference VARCHAR;
