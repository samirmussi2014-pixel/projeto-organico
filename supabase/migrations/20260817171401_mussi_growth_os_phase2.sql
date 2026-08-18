/*
# Mussi Growth OS — Phase 2 Enhancements

## Summary
Adds is_demo flags, audit log table, additional keyword seeds, and missing columns
to support duplicate prevention, demo data, validation, and tracking.

## Changes

1. New Tables
   - `audit_log` — records important changes (action, table_name, record_id, old_value, new_value, created_at)

2. Modified Tables
   - `cargas` — add `is_demo boolean DEFAULT false`
   - `embarcadores` — add `is_demo boolean DEFAULT false`
   - `transportadores` — add `is_demo boolean DEFAULT false`
   - `leads` — add `is_demo boolean DEFAULT false`, `prioridade text DEFAULT 'MEDIA'`
   - `oportunidades` — add `is_demo boolean DEFAULT false`, `classificacao text DEFAULT 'NAO CONFIRMADA'`, `data_validacao date`
   - `empresas` — add `is_demo boolean DEFAULT false`
   - `rotas` — add `is_demo boolean DEFAULT false`
   - `palavras_chave` — add `estado text`, `cidade text`, `segmento text`, `prioridade text DEFAULT 'MEDIA'`, `ultima_utilizacao date`

3. Seed Data
   - Insert 11 additional palavras-chave (carga fechada, frete de retorno, etc.)

4. Security
   - Enable RLS on audit_log with anon+authenticated CRUD (single-tenant, no auth)
*/

-- Add is_demo columns
ALTER TABLE cargas ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE embarcadores ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE transportadores ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE oportunidades ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE rotas ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- Add prioridade to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'MEDIA';

-- Add classificacao and data_validacao to oportunidades
ALTER TABLE oportunidades ADD COLUMN IF NOT EXISTS classificacao text DEFAULT 'NAO CONFIRMADA';
ALTER TABLE oportunidades ADD COLUMN IF NOT EXISTS data_validacao date;

-- Add fields to palavras_chave
ALTER TABLE palavras_chave ADD COLUMN IF NOT EXISTS estado text;
ALTER TABLE palavras_chave ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE palavras_chave ADD COLUMN IF NOT EXISTS segmento text;
ALTER TABLE palavras_chave ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'MEDIA';
ALTER TABLE palavras_chave ADD COLUMN IF NOT EXISTS ultima_utilizacao date;

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_log" ON audit_log;
CREATE POLICY "anon_select_audit_log" ON audit_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_log" ON audit_log;
CREATE POLICY "anon_insert_audit_log" ON audit_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_log" ON audit_log;
CREATE POLICY "anon_update_audit_log" ON audit_log FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_log" ON audit_log;
CREATE POLICY "anon_delete_audit_log" ON audit_log FOR DELETE
  TO anon, authenticated USING (true);

-- Seed additional keywords
INSERT INTO palavras_chave (termo, categoria, ativa)
VALUES
  ('carga fechada', 'oferta', true),
  ('frete de retorno', 'oferta', true),
  ('frete para caminhão', 'busca', true),
  ('transportadora para minha carga', 'busca', true),
  ('preciso de carreta para', 'busca', true),
  ('empresa procurando transportadora', 'busca', true),
  ('empresa precisa de transporte', 'busca', true),
  ('carga para carreta', 'oferta', true),
  ('carga para rodotrem', 'oferta', true),
  ('carga para bitrem', 'oferta', true),
  ('carga para truck', 'oferta', true)
ON CONFLICT DO NOTHING;

-- Add index for is_demo filtering
CREATE INDEX IF NOT EXISTS idx_cargas_is_demo ON cargas(is_demo);
CREATE INDEX IF NOT EXISTS idx_leads_is_demo ON leads(is_demo);
CREATE INDEX IF NOT EXISTS idx_oportunidades_is_demo ON oportunidades(is_demo);
