export interface ScoreInput {
  potencial_comercial?: string | number | null;
  urgencia?: string | number | null;
  volume?: string | number | null;
  frequencia?: string | number | null;
  compat_geo?: string | number | null;
  compat_rota?: string | number | null;
  facilidade_contato?: string | number | null;
  prob_resposta?: string | number | null;
  recorrencia?: string | number | null;
}

export interface ScoreBreakdown {
  potencial_comercial: number;
  urgencia: number;
  volume: number;
  frequencia: number;
  compat_geo: number;
  compat_rota: number;
  facilidade_contato: number;
  prob_resposta: number;
  recorrencia: number;
  total: number;
}

export const SCORE_WEIGHTS = {
  potencial_comercial: 20,
  urgencia: 15,
  volume: 15,
  frequencia: 15,
  compat_geo: 10,
  compat_rota: 10,
  facilidade_contato: 5,
  prob_resposta: 5,
  recorrencia: 5,
} as const;

export function calculateOpportunityScore(input: ScoreInput): ScoreBreakdown {
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));

  const potencial = clamp(Number(input.potencial_comercial) || 0, SCORE_WEIGHTS.potencial_comercial);
  const urgencia = clamp(Number(input.urgencia) || 0, SCORE_WEIGHTS.urgencia);
  const volume = clamp(Number(input.volume) || 0, SCORE_WEIGHTS.volume);
  const frequencia = clamp(Number(input.frequencia) || 0, SCORE_WEIGHTS.frequencia);
  const compatGeo = clamp(Number(input.compat_geo) || 0, SCORE_WEIGHTS.compat_geo);
  const compatRota = clamp(Number(input.compat_rota) || 0, SCORE_WEIGHTS.compat_rota);
  const facilidadeContato = clamp(Number(input.facilidade_contato) || 0, SCORE_WEIGHTS.facilidade_contato);
  const probResposta = clamp(Number(input.prob_resposta) || 0, SCORE_WEIGHTS.prob_resposta);
  const recorrencia = clamp(Number(input.recorrencia) || 0, SCORE_WEIGHTS.recorrencia);

  const total = potencial + urgencia + volume + frequencia + compatGeo + compatRota + facilidadeContato + probResposta + recorrencia;

  return {
    potencial_comercial: potencial,
    urgencia,
    volume,
    frequencia,
    compat_geo: compatGeo,
    compat_rota: compatRota,
    facilidade_contato: facilidadeContato,
    prob_resposta: probResposta,
    recorrencia,
    total: Math.min(100, total),
  };
}

export function scoreClassificacao(score: number): string {
  if (score >= 85) return 'PRIORIDADE_MAXIMA';
  if (score >= 70) return 'ALTO';
  if (score >= 40) return 'MEDIO';
  return 'BAIXO';
}

export function scorePrioridade(score: number): string {
  if (score >= 85) return 'PRIORIDADE_MAXIMA';
  if (score >= 70) return 'ALTA';
  if (score >= 40) return 'MEDIA';
  return 'BAIXA';
}

const HIGH_VALUE_KEYS_MAP: Record<string, string[]> = {
  cargas: ['empresa', 'contato_publico', 'telefone_publico', 'email_publico', 'evidencia', 'fonte', 'url_fonte', 'tipo_carga', 'origem', 'destino', 'tipo_veiculo', 'capacidade', 'frequencia'],
  embarcadores: ['empresa', 'contato_comercial_publico', 'site', 'evidencia', 'fonte', 'volume_estimado', 'frequencia_provavel', 'tipo_carga', 'origem_provavel', 'destino_provavel', 'segmento'],
  transportadores: ['transportadora', 'transportador_autonomo', 'motorista', 'contato_publico', 'rotas', 'areas_atendidas', 'perfil_profissional', 'fonte', 'tipo_veiculo', 'capacidade'],
  leads: ['empresa', 'pessoa', 'telefone', 'email', 'potencial', 'rota', 'tipo_carga', 'segmento', 'proxima_acao'],
  oportunidades: ['empresa', 'evidencia', 'fonte', 'url_fonte', 'tipo_carga', 'rota', 'potencial', 'frequencia', 'tipo_veiculo'],
  empresas: ['nome', 'site', 'telefone', 'email', 'segmento', 'tipo', 'cnpj'],
  rotas: ['nome', 'origem', 'destino', 'estado_origem', 'estado_destino', 'tipo_carga', 'frequencia', 'distancia_km'],
};

export function autoScoreFromFields(
  record: Record<string, unknown>,
  highValueKeys: string[],
): number {
  let score = 0;
  let filled = 0;

  for (const key of highValueKeys) {
    const val = record[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      filled++;
    }
  }

  const fillRatio = highValueKeys.length > 0 ? filled / highValueKeys.length : 0;
  score = Math.round(fillRatio * 100);

  const hasEvidence = record.evidencia && String(record.evidencia).trim() !== '';
  const hasFonte = record.fonte && String(record.fonte).trim() !== '';
  const hasUrl = record.url_fonte && String(record.url_fonte).trim() !== '';

  if (hasEvidence) score = Math.min(100, score + 5);
  if (hasFonte) score = Math.min(100, score + 3);
  if (hasUrl) score = Math.min(100, score + 2);

  return Math.min(100, Math.max(0, score));
}

export function autoScoreForTable(
  table: string,
  record: Record<string, unknown>,
): number {
  const keys = HIGH_VALUE_KEYS_MAP[table] ?? [];
  return autoScoreFromFields(record, keys);
}

export function calculateValidationScore(answers: Record<string, boolean>): number {
  const weights: Record<string, number> = {
    evidencia: 20,
    fonte_confiavel: 15,
    data_recente: 10,
    contato_publico: 15,
    origem_definida: 10,
    destino_definido: 10,
    tipo_veiculo_definido: 10,
    demanda_recorrente: 10,
  };
  let total = 0;
  for (const [key, val] of Object.entries(answers)) {
    if (val && weights[key]) total += weights[key];
  }
  return Math.min(100, total);
}

export function classificacaoFromScore(score: number, hasEvidence: boolean): string {
  if (score >= 70 && hasEvidence) return 'CONFIRMADA';
  if (score >= 40) return 'PROVAVEL';
  return 'NAO_CONFIRMADA';
}
