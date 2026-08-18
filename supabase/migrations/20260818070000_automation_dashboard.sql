/* Mussi Fretes — Automation dashboard telemetry */

CREATE TABLE IF NOT EXISTS automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'scheduler',
  mode text NOT NULL DEFAULT 'OBSERVACAO',
  status text NOT NULL DEFAULT 'ok',
  leads integer NOT NULL DEFAULT 0,
  cargas integer NOT NULL DEFAULT 0,
  oportunidades integer NOT NULL DEFAULT 0,
  palavras_chave integer NOT NULL DEFAULT 0,
  oportunidades_geradas integer NOT NULL DEFAULT 0,
  conteudos_gerados integer NOT NULL DEFAULT 0,
  palavras_processadas integer NOT NULL DEFAULT 0,
  whatsapp_enviados integer NOT NULL DEFAULT 0,
  whatsapp_falhos integer NOT NULL DEFAULT 0,
  whatsapp_pulados integer NOT NULL DEFAULT 0,
  erro text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_automation_runs" ON automation_runs;
CREATE POLICY "anon_select_automation_runs"
  ON automation_runs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_automation_runs" ON automation_runs;
CREATE POLICY "anon_insert_automation_runs"
  ON automation_runs FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS automation_runs_created_idx
  ON automation_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS automation_runs_status_idx
  ON automation_runs(status);
