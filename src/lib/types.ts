export interface BaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Empresa extends BaseRecord {
  nome: string;
  nome_fantasia?: string;
  cnpj?: string;
  segmento?: string;
  cidade?: string;
  estado?: string;
  site?: string;
  telefone?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  tipo?: string;
  observacoes?: string;
  fonte_id?: string;
  score?: number;
  is_demo?: boolean;
}

export interface Carga extends BaseRecord {
  empresa?: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  tipo_carga?: string;
  origem?: string;
  destino?: string;
  rota?: string;
  tipo_veiculo?: string;
  capacidade?: string;
  frequencia?: string;
  contato_publico?: string;
  telefone_publico?: string;
  email_publico?: string;
  url_fonte?: string;
  nome_fonte?: string;
  fonte?: string;
  data_descoberta?: string;
  evidencia?: string;
  observacoes?: string;
  score: number;
  classificacao?: string;
  status?: string;
  is_demo?: boolean;
}

export interface Embarcador extends BaseRecord {
  empresa?: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  tipo_carga?: string;
  origem_provavel?: string;
  destino_provavel?: string;
  rota?: string;
  frequencia_provavel?: string;
  volume_estimado?: string;
  contato_comercial_publico?: string;
  site?: string;
  rede_social_publica?: string;
  fonte?: string;
  evidencia?: string;
  observacoes?: string;
  score: number;
  classificacao?: string;
  status?: string;
  is_demo?: boolean;
}

export interface Transportador extends BaseRecord {
  transportadora?: string;
  transportador_autonomo?: string;
  motorista?: string;
  agregado?: string;
  frotista?: string;
  cidade?: string;
  estado?: string;
  tipo_veiculo?: string;
  capacidade?: string;
  rotas?: string;
  areas_atendidas?: string;
  contato_publico?: string;
  perfil_profissional?: string;
  fonte?: string;
  evidencia?: string;
  observacoes?: string;
  score: number;
  classificacao?: string;
  status?: string;
  is_demo?: boolean;
}

export interface Lead extends BaseRecord {
  empresa?: string;
  pessoa?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  origem?: string;
  rota?: string;
  tipo_carga?: string;
  potencial?: string;
  score: number;
  status: string;
  prioridade?: string;
  proxima_acao?: string;
  data_proximo_contato?: string;
  observacoes?: string;
  fonte?: string;
  is_demo?: boolean;
}

export interface Oportunidade extends BaseRecord {
  empresa?: string;
  tipo?: string;
  titulo?: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  origem?: string;
  destino?: string;
  rota?: string;
  tipo_carga?: string;
  tipo_veiculo?: string;
  capacidade?: string;
  frequencia?: string;
  potencial?: string;
  score: number;
  classificacao?: string;
  status: string;
  evidencia?: string;
  fonte?: string;
  url_fonte?: string;
  acao_recomendada?: string;
  data_descoberta?: string;
  data_validacao?: string;
  observacoes?: string;
  lead_id?: string;
  origem_tipo?: string;
  origem_id?: string;
  is_demo?: boolean;
}

export interface Fonte extends BaseRecord {
  nome: string;
  url?: string;
  tipo?: string;
  confiabilidade?: string;
  observacoes?: string;
  data?: string;
  ativo?: boolean;
}

export interface Rota extends BaseRecord {
  nome?: string;
  origem: string;
  destino: string;
  estado_origem?: string;
  estado_destino?: string;
  distancia_km?: string;
  tempo_estimado?: string;
  tipo_carga?: string;
  tipo_veiculo?: string;
  frequencia?: string;
  potencial?: string;
  score: number;
  status?: string;
  observacoes?: string;
  is_demo?: boolean;
}

export interface PalavraChave extends BaseRecord {
  termo: string;
  categoria?: string;
  estado?: string;
  cidade?: string;
  segmento?: string;
  ativa: boolean;
  prioridade?: string;
  ultima_utilizacao?: string;
}

export interface Conteudo extends BaseRecord {
  titulo: string;
  assunto?: string;
  palavra_chave?: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  rota?: string;
  tipo?: string;
  status?: string;
  data?: string;
  conteudo?: string;
  cta?: string;
}

export interface SeoKeyword extends BaseRecord {
  termo: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  volume_estimado?: string;
  dificuldade?: string;
  status?: string;
  observacoes?: string;
}

export interface Tarefa extends BaseRecord {
  titulo: string;
  descricao?: string;
  responsavel?: string;
  prioridade?: string;
  prazo?: string | null;
  status: string;
  modulo_relacionado?: string;
  observacoes?: string;
}

export interface Memoria extends BaseRecord {
  empresa?: string;
  empresa_contatada?: string;
  resposta?: string;
  status?: string;
  rota?: string;
  segmento?: string;
  resultado?: string;
  conteudo_publicado?: string;
  performance?: string;
  motivo_perda?: string;
  melhor_horario?: string;
  melhor_abordagem?: string;
  observacoes?: string;
}

export interface Interacao extends BaseRecord {
  lead_id?: string;
  empresa_id?: string;
  oportunidade_id?: string;
  tipo?: string;
  data?: string;
  resultado?: string;
  observacoes?: string;
  proxima_acao?: string;
}

export interface Metric extends BaseRecord {
  data?: string;
  metrica?: string;
  valor?: number;
  observacoes?: string;
}

export interface AuditLog extends BaseRecord {
  table_name: string;
  record_id?: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}
