/*
# Mussi Fretes Brasil — Growth OS Schema

Creates the full data model for the internal growth operating system:
cargas, embarcadores, transportadores, leads, oportunidades, empresas,
fontes, rotas, palavras-chave, conteudos, seo_keywords, tarefas, memoria,
daily_reports, weekly_reports, contacts, interactions, publications, metrics.

All tables are single-tenant (no auth) — the app uses the anon key.
RLS enabled on every table with anon+authenticated CRUD policies.
Includes a scoring function used by the radars.
*/

-- ============================================================
-- Helper: generic RLS policy generator is not available, so we
-- hand-write 4 policies per table. To keep this migration readable
-- we define a reusable comment block convention.
-- ============================================================

-- ----------------------------------------------------------
-- 1. cargas (Radar de Cargas)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text NOT NULL DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  tipo_carga text DEFAULT '',
  origem text DEFAULT '',
  destino text DEFAULT '',
  rota text DEFAULT '',
  tipo_veiculo text DEFAULT '',
  capacidade text DEFAULT '',
  frequencia text DEFAULT '',
  contato_publico text DEFAULT '',
  telefone_publico text DEFAULT '',
  email_publico text DEFAULT '',
  url_fonte text DEFAULT '',
  nome_fonte text DEFAULT '',
  data_descoberta date DEFAULT CURRENT_DATE,
  evidencia text DEFAULT '',
  observacoes text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  classificacao text NOT NULL DEFAULT 'NAO CONFIRMADA',
  status text NOT NULL DEFAULT 'NOVO',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE cargas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_cargas" ON cargas;
CREATE POLICY "anon_select_cargas" ON cargas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cargas" ON cargas;
CREATE POLICY "anon_insert_cargas" ON cargas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cargas" ON cargas;
CREATE POLICY "anon_update_cargas" ON cargas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cargas" ON cargas;
CREATE POLICY "anon_delete_cargas" ON cargas FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS cargas_score_idx ON cargas(score DESC);
CREATE INDEX IF NOT EXISTS cargas_estado_idx ON cargas(estado);
CREATE INDEX IF NOT EXISTS cargas_created_idx ON cargas(created_at DESC);

-- ----------------------------------------------------------
-- 2. embarcadores (Radar de Embarcadores)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS embarcadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text NOT NULL DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  tipo_carga text DEFAULT '',
  origem_provavel text DEFAULT '',
  destino_provavel text DEFAULT '',
  frequencia_provavel text DEFAULT '',
  volume_estimado text DEFAULT '',
  contato_comercial_publico text DEFAULT '',
  site text DEFAULT '',
  rede_social_publica text DEFAULT '',
  fonte text DEFAULT '',
  evidencia text DEFAULT '',
  observacoes text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  classificacao text NOT NULL DEFAULT 'NAO CONFIRMADA',
  status text NOT NULL DEFAULT 'NOVO',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE embarcadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_embarcadores" ON embarcadores;
CREATE POLICY "anon_select_embarcadores" ON embarcadores FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_embarcadores" ON embarcadores;
CREATE POLICY "anon_insert_embarcadores" ON embarcadores FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_embarcadores" ON embarcadores;
CREATE POLICY "anon_update_embarcadores" ON embarcadores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_embarcadores" ON embarcadores;
CREATE POLICY "anon_delete_embarcadores" ON embarcadores FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS embarcadores_score_idx ON embarcadores(score DESC);
CREATE INDEX IF NOT EXISTS embarcadores_estado_idx ON embarcadores(estado);

-- ----------------------------------------------------------
-- 3. transportadores (Radar de Transportadores)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS transportadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transportadora text DEFAULT '',
  transportador_autonomo text DEFAULT '',
  motorista text DEFAULT '',
  agregado text DEFAULT '',
  frotista text DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  tipo_veiculo text DEFAULT '',
  capacidade text DEFAULT '',
  rotas text DEFAULT '',
  areas_atendidas text DEFAULT '',
  contato_publico text DEFAULT '',
  perfil_profissional text DEFAULT '',
  fonte text DEFAULT '',
  observacoes text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  classificacao text NOT NULL DEFAULT 'NAO CONFIRMADA',
  status text NOT NULL DEFAULT 'NOVO',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE transportadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_transportadores" ON transportadores;
CREATE POLICY "anon_select_transportadores" ON transportadores FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transportadores" ON transportadores;
CREATE POLICY "anon_insert_transportadores" ON transportadores FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transportadores" ON transportadores;
CREATE POLICY "anon_update_transportadores" ON transportadores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transportadores" ON transportadores;
CREATE POLICY "anon_delete_transportadores" ON transportadores FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS transportadores_score_idx ON transportadores(score DESC);
CREATE INDEX IF NOT EXISTS transportadores_estado_idx ON transportadores(estado);

-- ----------------------------------------------------------
-- 4. leads
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text NOT NULL DEFAULT '',
  pessoa text DEFAULT '',
  telefone text DEFAULT '',
  email text DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  origem text DEFAULT '',
  rota text DEFAULT '',
  tipo_carga text DEFAULT '',
  potencial text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'NOVO',
  observacoes text DEFAULT '',
  proxima_acao text DEFAULT '',
  data_proximo_contato date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);

-- ----------------------------------------------------------
-- 5. oportunidades
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text NOT NULL DEFAULT '',
  tipo text DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  rota text DEFAULT '',
  tipo_carga text DEFAULT '',
  potencial text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  evidencia text DEFAULT '',
  fonte text DEFAULT '',
  acao_recomendada text DEFAULT '',
  status text NOT NULL DEFAULT 'NOVO',
  origem_tipo text DEFAULT '',
  origem_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_oportunidades" ON oportunidades;
CREATE POLICY "anon_select_oportunidades" ON oportunidades FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_oportunidades" ON oportunidades;
CREATE POLICY "anon_insert_oportunidades" ON oportunidades FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_oportunidades" ON oportunidades;
CREATE POLICY "anon_update_oportunidades" ON oportunidades FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_oportunidades" ON oportunidades;
CREATE POLICY "anon_delete_oportunidades" ON oportunidades FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS oportunidades_score_idx ON oportunidades(score DESC);
CREATE INDEX IF NOT EXISTS oportunidades_status_idx ON oportunidades(status);

-- ----------------------------------------------------------
-- 6. empresas
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  tipo text DEFAULT '',
  site text DEFAULT '',
  telefone text DEFAULT '',
  email text DEFAULT '',
  observacoes text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_empresas" ON empresas;
CREATE POLICY "anon_select_empresas" ON empresas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_empresas" ON empresas;
CREATE POLICY "anon_insert_empresas" ON empresas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_empresas" ON empresas;
CREATE POLICY "anon_update_empresas" ON empresas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_empresas" ON empresas;
CREATE POLICY "anon_delete_empresas" ON empresas FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 7. fontes
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fontes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  url text DEFAULT '',
  tipo text DEFAULT '',
  data date DEFAULT CURRENT_DATE,
  confiabilidade text DEFAULT 'MEDIA',
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE fontes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_fontes" ON fontes;
CREATE POLICY "anon_select_fontes" ON fontes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_fontes" ON fontes;
CREATE POLICY "anon_insert_fontes" ON fontes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_fontes" ON fontes;
CREATE POLICY "anon_update_fontes" ON fontes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_fontes" ON fontes;
CREATE POLICY "anon_delete_fontes" ON fontes FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 8. rotas
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS rotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  origem text DEFAULT '',
  destino text DEFAULT '',
  estado_origem text DEFAULT '',
  estado_destino text DEFAULT '',
  distancia_km text DEFAULT '',
  tempo_estimado text DEFAULT '',
  tipo_carga text DEFAULT '',
  frequencia text DEFAULT '',
  observacoes text DEFAULT '',
  score int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE rotas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_rotas" ON rotas;
CREATE POLICY "anon_select_rotas" ON rotas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_rotas" ON rotas;
CREATE POLICY "anon_insert_rotas" ON rotas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_rotas" ON rotas;
CREATE POLICY "anon_update_rotas" ON rotas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_rotas" ON rotas;
CREATE POLICY "anon_delete_rotas" ON rotas FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 9. palavras_chave
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS palavras_chave (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  termo text NOT NULL DEFAULT '',
  categoria text DEFAULT '',
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE palavras_chave ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_palavras_chave" ON palavras_chave;
CREATE POLICY "anon_select_palavras_chave" ON palavras_chave FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_palavras_chave" ON palavras_chave;
CREATE POLICY "anon_insert_palavras_chave" ON palavras_chave FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_palavras_chave" ON palavras_chave;
CREATE POLICY "anon_update_palavras_chave" ON palavras_chave FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_palavras_chave" ON palavras_chave;
CREATE POLICY "anon_delete_palavras_chave" ON palavras_chave FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 10. conteudos
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS conteudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT '',
  assunto text DEFAULT '',
  palavra_chave text DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  rota text DEFAULT '',
  tipo text DEFAULT '',
  status text NOT NULL DEFAULT 'RASCUNHO',
  data date DEFAULT CURRENT_DATE,
  conteudo text DEFAULT '',
  cta text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE conteudos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_conteudos" ON conteudos;
CREATE POLICY "anon_select_conteudos" ON conteudos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_conteudos" ON conteudos;
CREATE POLICY "anon_insert_conteudos" ON conteudos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_conteudos" ON conteudos;
CREATE POLICY "anon_update_conteudos" ON conteudos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_conteudos" ON conteudos;
CREATE POLICY "anon_delete_conteudos" ON conteudos FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 11. seo_keywords
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  termo text NOT NULL DEFAULT '',
 cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT '',
  volume_estimado text DEFAULT '',
  dificuldade text DEFAULT '',
  status text NOT NULL DEFAULT 'ATIVA',
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_seo_keywords" ON seo_keywords;
CREATE POLICY "anon_select_seo_keywords" ON seo_keywords FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_seo_keywords" ON seo_keywords;
CREATE POLICY "anon_insert_seo_keywords" ON seo_keywords FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_seo_keywords" ON seo_keywords;
CREATE POLICY "anon_update_seo_keywords" ON seo_keywords FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_seo_keywords" ON seo_keywords;
CREATE POLICY "anon_delete_seo_keywords" ON seo_keywords FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 12. tarefas
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT '',
  descricao text DEFAULT '',
  responsavel text DEFAULT '',
  prioridade text NOT NULL DEFAULT 'MEDIA',
  prazo date,
  status text NOT NULL DEFAULT 'PENDENTE',
  modulo_relacionado text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tarefas" ON tarefas;
CREATE POLICY "anon_select_tarefas" ON tarefas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tarefas" ON tarefas;
CREATE POLICY "anon_insert_tarefas" ON tarefas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tarefas" ON tarefas;
CREATE POLICY "anon_update_tarefas" ON tarefas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tarefas" ON tarefas;
CREATE POLICY "anon_delete_tarefas" ON tarefas FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 13. memoria
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS memoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text DEFAULT '',
  empresa_contatada text DEFAULT '',
  resposta text DEFAULT '',
  status text DEFAULT '',
  rota text DEFAULT '',
  segmento text DEFAULT '',
  resultado text DEFAULT '',
  conteudo_publicado text DEFAULT '',
  performance text DEFAULT '',
  motivo_perda text DEFAULT '',
  melhor_horario text DEFAULT '',
  melhor_abordagem text DEFAULT '',
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE memoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_memoria" ON memoria;
CREATE POLICY "anon_select_memoria" ON memoria FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_memoria" ON memoria;
CREATE POLICY "anon_insert_memoria" ON memoria FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_memoria" ON memoria;
CREATE POLICY "anon_update_memoria" ON memoria FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_memoria" ON memoria;
CREATE POLICY "anon_delete_memoria" ON memoria FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 14. contacts (contatos)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text DEFAULT '',
  pessoa text DEFAULT '',
  telefone text DEFAULT '',
  email text DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  origem text DEFAULT '',
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 15. interactions (interações)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  tipo text DEFAULT '',
  descricao text DEFAULT '',
  resultado text DEFAULT '',
  data timestamptz DEFAULT now()
);
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_interactions" ON interactions;
CREATE POLICY "anon_select_interactions" ON interactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_interactions" ON interactions;
CREATE POLICY "anon_insert_interactions" ON interactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_interactions" ON interactions;
CREATE POLICY "anon_update_interactions" ON interactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_interactions" ON interactions;
CREATE POLICY "anon_delete_interactions" ON interactions FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 16. publications (publicações)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo_id uuid REFERENCES conteudos(id) ON DELETE CASCADE,
  canal text DEFAULT '',
  status text NOT NULL DEFAULT 'AGENDADA',
  data_publicacao timestamptz,
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_publications" ON publications;
CREATE POLICY "anon_select_publications" ON publications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_publications" ON publications;
CREATE POLICY "anon_insert_publications" ON publications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_publications" ON publications;
CREATE POLICY "anon_update_publications" ON publications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_publications" ON publications;
CREATE POLICY "anon_delete_publications" ON publications FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 17. metrics (métricas)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  metrica text NOT NULL DEFAULT '',
  valor numeric DEFAULT 0,
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_metrics" ON metrics;
CREATE POLICY "anon_select_metrics" ON metrics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_metrics" ON metrics;
CREATE POLICY "anon_insert_metrics" ON metrics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_metrics" ON metrics;
CREATE POLICY "anon_update_metrics" ON metrics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_metrics" ON metrics;
CREATE POLICY "anon_delete_metrics" ON metrics FOR DELETE TO anon, authenticated USING (true);

-- ----------------------------------------------------------
-- 18. app_settings (configurações)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1,
  modo_operacao text NOT NULL DEFAULT 'OBSERVACAO',
  custo_operacional numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Ensure the single settings row exists
INSERT INTO app_settings (id, modo_operacao, custo_operacional)
VALUES (1, 'OBSERVACAO', 0)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- Seed initial palavras-chave
-- ----------------------------------------------------------
INSERT INTO palavras_chave (termo, categoria) VALUES
('procuro caminhão', 'busca'),
('procuro transportadora', 'busca'),
('preciso de transporte', 'busca'),
('carga disponível', 'oferta'),
('frete disponível', 'oferta'),
('carga para transportar', 'oferta'),
('procuro carreta', 'busca'),
('preciso de carreta', 'busca'),
('frete urgente', 'urgente'),
('transportador', 'perfil'),
('motorista', 'perfil'),
('retorno de carga', 'oferta'),
('procuro carga', 'busca'),
('procuro frete', 'busca'),
('caminhão disponível', 'oferta'),
('carreta disponível', 'oferta'),
('faço rota', 'perfil'),
('tenho caminhão', 'perfil'),
('procuro embarque', 'busca')
ON CONFLICT DO NOTHING;

-- Seed initial SEO keywords
INSERT INTO seo_keywords (termo, status) VALUES
('frete', 'ATIVA'),
('fretes', 'ATIVA'),
('transporte de cargas', 'ATIVA'),
('transportadora', 'ATIVA'),
('carga', 'ATIVA'),
('motorista', 'ATIVA'),
('transportador', 'ATIVA'),
('embarque', 'ATIVA'),
('frete Goiás', 'ATIVA'),
('frete Tocantins', 'ATIVA'),
('frete Maranhão', 'ATIVA'),
('frete Pará', 'ATIVA'),
('frete Mato Grosso', 'ATIVA'),
('fretes Goiânia', 'ATIVA'),
('fretes Aparecida de Goiânia', 'ATIVA')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------
-- Scoring function
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION classify_score(s int)
RETURNS text AS $$
BEGIN
  IF s >= 85 THEN RETURN 'PRIORIDADE MAXIMA';
  ELSIF s >= 70 THEN RETURN 'ALTO';
  ELSIF s >= 40 THEN RETURN 'MEDIO';
  ELSE RETURN 'BAIXO';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
