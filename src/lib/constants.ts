export type ScoreClass = 'PRIORIDADE MAXIMA' | 'ALTO' | 'MEDIO' | 'BAIXO';

export function classifyScore(score: number): ScoreClass {
  if (score >= 85) return 'PRIORIDADE MAXIMA';
  if (score >= 70) return 'ALTO';
  if (score >= 40) return 'MEDIO';
  return 'BAIXO';
}

export function scoreColor(score: number): string {
  if (score >= 85) return 'text-rose-600 bg-rose-50 border-rose-200';
  if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
  if (score >= 40) return 'text-blue-600 bg-blue-50 border-blue-200';
  return 'text-slate-500 bg-slate-50 border-slate-200';
}

export function classificacaoColor(classificacao: string): string {
  switch (classificacao) {
    case 'CONFIRMADA':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'PROVAVEL':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    default:
      return 'text-slate-500 bg-slate-50 border-slate-200';
  }
}

export function statusColor(status: string): string {
  const s = status.toUpperCase().replace(/ /g, '_');
  if (['GANHO', 'CONCLUIDA', 'CONFIRMADA', 'RESPONDEU', 'CONVERTIDA', 'QUALIFICADA'].includes(s))
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (['NEGOCIACAO', 'EM_ANDAMENTO', 'QUALIFICANDO', 'CONTATO_REALIZADO', 'EM_ANALISE', 'CONTATO_PREPARADO'].includes(s))
    return 'text-blue-700 bg-blue-50 border-blue-200';
  if (['PERDIDO', 'CANCELADA', 'DESCARTADA'].includes(s))
    return 'text-rose-700 bg-rose-50 border-rose-200';
  return 'text-slate-600 bg-slate-50 border-slate-200';
}

export function prioridadeColor(p: string): string {
  switch (p.toUpperCase()) {
    case 'PRIORIDADE_MAXIMA':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    case 'ALTA':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'MEDIA':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'BAIXA':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export const ESTADOS_BR = [
  'GO', 'TO', 'MA', 'PA', 'MT',
  'DF', 'MG', 'SP', 'MS', 'PR',
  'SC', 'RS', 'BA', 'PE', 'CE',
  'ES', 'RJ', 'AC', 'AL', 'AM',
  'AP', 'PB', 'PI', 'RN', 'RO', 'RR', 'SE',
];

export const SEGMENTOS = [
  'Indústria', 'Distribuidora', 'Atacadista', 'Varejista', 'Agronegócio',
  'Produtor', 'Cooperativa', 'Centro de Distribuição', 'Alimentos',
  'Bebidas', 'Materiais de Construção', 'Fertilizantes', 'Grãos',
  'Máquinas', 'Equipamentos', 'Autopeças', 'E-commerce', 'Operador Logístico',
  'Outro',
];

export const TIPOS_CARGA = [
  'Carga Geral', 'Carga Fracionada', 'Carga Fechada', 'Granel Sólido',
  'Granel Líquido', 'Refrigerada', 'Perigosa', 'Container', 'Projeto',
  'Animais Vivos', 'Outro',
];

export const TIPOS_VEICULO = [
  'Caminhão 3/4', 'Caminhão Toco', 'Caminhão Truck', 'Carreta 2 Eixos',
  'Carreta 3 Eixos', 'Bitrem', 'Rodotrem', 'Bitruck', 'Cegonha', 'Outro',
];

export const TIPOS_FONTE = [
  'Google', 'Google Maps', 'Site Empresarial', 'Diretório Público',
  'Rede Social Pública', 'Notícia', 'Associação', 'Fabricante',
  'Distribuidor', 'Indústria', 'Portal Logístico', 'Outra Fonte Pública',
];

export const TIPOS_CONTEUDO = [
  'Artigo', 'Facebook', 'Instagram', 'LinkedIn', 'Roteiro de Vídeo',
  'FAQ', 'SEO', 'Chamada Comercial',
];

export const LEAD_STATUS: string[] = [
  'NOVO', 'QUALIFICANDO', 'CONTATO_PREPARADO', 'CONTATO_REALIZADO',
  'RESPONDEU', 'NEGOCIACAO', 'GANHO', 'PERDIDO',
];

export const OPORTUNIDADE_STATUS = ['NOVA', 'EM_ANALISE', 'QUALIFICADA', 'CONVERTIDA', 'DESCARTADA'];

export const TAREFA_STATUS = ['PENDENTE', 'EM ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];

export const CLASSIFICACOES = ['CONFIRMADA', 'PROVAVEL', 'NAO CONFIRMADA'];

export const CONFIABILIDADES = ['ALTA', 'MEDIA', 'BAIXA'];

export function formatDate(d: string | null | undefined): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('pt-BR');
  } catch {
    return d;
  }
}

export function formatDateTime(d: string | null | undefined): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}
