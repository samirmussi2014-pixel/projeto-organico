import { supabase } from './supabase';
import { autoScoreForTable } from './scoring';

export async function loadDemoData(): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  const empresas = [
    { nome: '[DEMO] AgroSul Distribuidora', segmento: 'Distribuidora', cidade: 'Goiânia', estado: 'GO', site: 'https://exemplo.com', telefone: '(62) 3000-0000', email: 'contato@exemplo.com', tipo: 'DISTRIBUIDOR', is_demo: true },
    { nome: '[DEMO] Construtora Centro-Oeste', segmento: 'Materiais de construção', cidade: 'Aparecida de Goiânia', estado: 'GO', site: 'https://exemplo.com', telefone: '(62) 3000-0001', email: 'contato@exemplo.com', tipo: 'VAREJISTA', is_demo: true },
    { nome: '[DEMO] Indústria Alimentos Norte', segmento: 'Alimentos', cidade: 'Imperatriz', estado: 'MA', site: 'https://exemplo.com', telefone: '(99) 3000-0000', email: 'contato@exemplo.com', tipo: 'INDUSTRIA', is_demo: true },
    { nome: '[DEMO] Cooperativa Grãos MT', segmento: 'Agronegócio', cidade: 'Cuiabá', estado: 'MT', site: 'https://exemplo.com', telefone: '(65) 3000-0000', email: 'contato@exemplo.com', tipo: 'COOPERATIVA', is_demo: true },
    { nome: '[DEMO] Atacadão Beira Rio', segmento: 'Atacado', cidade: 'Belém', estado: 'PA', site: 'https://exemplo.com', telefone: '(91) 3000-0000', email: 'contato@exemplo.com', tipo: 'ATACADISTA', is_demo: true },
  ];

  for (const e of empresas) {
    const payload = { ...e, score: autoScoreForTable('empresas', e as Record<string, unknown>) };
    const { error } = await supabase.from('empresas').insert(payload);
    if (error) errors.push(`empresas: ${error.message}`);
    else inserted++;
  }

  const cargas = [
    { empresa: '[DEMO] AgroSul Distribuidora', cidade: 'Goiânia', estado: 'GO', segmento: 'Distribuidora', tipo_carga: 'Alimentos', origem: 'Goiânia', destino: 'Belém', rota: 'Goiânia → Belém', tipo_veiculo: 'Baú', capacidade: '12 ton', frequencia: 'Semanal', contato_publico: 'João', telefone_publico: '(62) 3000-0000', email_publico: 'contato@exemplo.com', fonte: 'Google Maps', evidencia: 'Site oficial', score: 75, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Construtora Centro-Oeste', cidade: 'Aparecida de Goiânia', estado: 'GO', segmento: 'Materiais de construção', tipo_carga: 'Material de construção', origem: 'Aparecida de Goiânia', destino: 'Palmas', rota: 'Aparecida → Palmas', tipo_veiculo: 'Bitrem', capacidade: '30 ton', frequencia: 'Quinzenal', contato_publico: 'Maria', telefone_publico: '(62) 3000-0001', email_publico: 'contato@exemplo.com', fonte: 'Site empresarial', evidencia: 'Página de contato', score: 80, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Indústria Alimentos Norte', cidade: 'Imperatriz', estado: 'MA', segmento: 'Alimentos', tipo_carga: 'Alimentos', origem: 'Imperatriz', destino: 'São Luís', rota: 'Imperatriz → São Luís', tipo_veiculo: 'Truck', capacidade: '8 ton', frequencia: 'Diário', contato_publico: 'Carlos', telefone_publico: '(99) 3000-0000', email_publico: 'contato@exemplo.com', fonte: 'Diretório público', evidencia: 'Listagem em diretório', score: 65, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Cooperativa Grãos MT', cidade: 'Cuiabá', estado: 'MT', segmento: 'Agronegócio', tipo_carga: 'Grãos', origem: 'Cuiabá', destino: 'Santos', rota: 'Cuiabá → Santos', tipo_veiculo: 'Rodotrem', capacidade: '45 ton', frequencia: 'Semanal', contato_publico: 'Pedro', telefone_publico: '(65) 3000-0000', email_publico: 'contato@exemplo.com', fonte: 'Associação', evidencia: 'Site da associação', score: 85, classificacao: 'CONFIRMADA', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Atacadão Beira Rio', cidade: 'Belém', estado: 'PA', segmento: 'Atacado', tipo_carga: 'Mistos', origem: 'Belém', destino: 'Manaus', rota: 'Belém → Manaus', tipo_veiculo: 'Carreta LS', capacidade: '25 ton', frequencia: 'Semanal', contato_publico: 'Ana', telefone_publico: '(91) 3000-0000', email_publico: 'contato@exemplo.com', fonte: 'Google', evidencia: 'Resultados de busca', score: 70, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
  ];

  for (const c of cargas) {
    const { error } = await supabase.from('cargas').insert(c);
    if (error) errors.push(`cargas: ${error.message}`);
    else inserted++;
  }

  const embarcadores = [
    { empresa: '[DEMO] AgroSul Distribuidora', cidade: 'Goiânia', estado: 'GO', segmento: 'Distribuidora', tipo_carga: 'Alimentos', origem_provavel: 'Goiânia', destino_provavel: 'Belém', frequencia_provavel: 'Semanal', volume_estimado: '12 ton/semana', contato_comercial_publico: 'João', site: 'https://exemplo.com', fonte: 'Google Maps', evidencia: 'Site oficial', score: 75, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Construtora Centro-Oeste', cidade: 'Aparecida de Goiânia', estado: 'GO', segmento: 'Materiais de construção', tipo_carga: 'Material de construção', origem_provavel: 'Aparecida de Goiânia', destino_provavel: 'Palmas', frequencia_provavel: 'Quinzenal', volume_estimado: '30 ton/quinzena', contato_comercial_publico: 'Maria', site: 'https://exemplo.com', fonte: 'Site empresarial', evidencia: 'Página de contato', score: 80, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Indústria Alimentos Norte', cidade: 'Imperatriz', estado: 'MA', segmento: 'Alimentos', tipo_carga: 'Alimentos', origem_provavel: 'Imperatriz', destino_provavel: 'São Luís', frequencia_provavel: 'Diário', volume_estimado: '8 ton/dia', contato_comercial_publico: 'Carlos', site: 'https://exemplo.com', fonte: 'Diretório público', evidencia: 'Listagem', score: 65, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Cooperativa Grãos MT', cidade: 'Cuiabá', estado: 'MT', segmento: 'Agronegócio', tipo_carga: 'Grãos', origem_provavel: 'Cuiabá', destino_provavel: 'Santos', frequencia_provavel: 'Semanal', volume_estimado: '45 ton/semana', contato_comercial_publico: 'Pedro', site: 'https://exemplo.com', fonte: 'Associação', evidencia: 'Site da associação', score: 85, classificacao: 'CONFIRMADA', status: 'NOVO', is_demo: true },
    { empresa: '[DEMO] Atacadão Beira Rio', cidade: 'Belém', estado: 'PA', segmento: 'Atacado', tipo_carga: 'Mistos', origem_provavel: 'Belém', destino_provavel: 'Manaus', frequencia_provavel: 'Semanal', volume_estimado: '25 ton/semana', contato_comercial_publico: 'Ana', site: 'https://exemplo.com', fonte: 'Google', evidencia: 'Resultados de busca', score: 70, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
  ];

  for (const e of embarcadores) {
    const { error } = await supabase.from('embarcadores').insert(e);
    if (error) errors.push(`embarcadores: ${error.message}`);
    else inserted++;
  }

  const transportadores = [
    { transportadora: '[DEMO] Expresso Cerrado', cidade: 'Goiânia', estado: 'GO', tipo_veiculo: 'Baú', capacidade: '12 ton', rotas: 'Goiânia → Belém', areas_atendidas: 'CO, N', contato_publico: '(62) 99999-0000', perfil_profissional: 'Transportadora regional', fonte: 'Google Maps', score: 70, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { transportadora: '[DEMO] TransNorte Logística', cidade: 'Imperatriz', estado: 'MA', tipo_veiculo: 'Truck', capacidade: '8 ton', rotas: 'Imperatriz → São Luís', areas_atendidas: 'MA, PA', contato_publico: '(99) 99999-0000', perfil_profissional: 'Logística regional', fonte: 'Diretório público', score: 65, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { transportador_autonomo: '[DEMO] Motorista José', cidade: 'Cuiabá', estado: 'MT', tipo_veiculo: 'Rodotrem', capacidade: '45 ton', rotas: 'Cuiabá → Santos', areas_atendidas: 'MT, SP', contato_publico: '(65) 99999-0000', perfil_profissional: 'Autônomo', fonte: 'Rede social pública', score: 60, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { transportadora: '[DEMO] Carajas Transportes', cidade: 'Belém', estado: 'PA', tipo_veiculo: 'Carreta LS', capacidade: '25 ton', rotas: 'Belém → Manaus', areas_atendidas: 'PA, AM', contato_publico: '(91) 99999-0000', perfil_profissional: 'Transportadora regional', fonte: 'Google', score: 68, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
    { frotista: '[DEMO] Frota Sul', cidade: 'Aparecida de Goiânia', estado: 'GO', tipo_veiculo: 'Bitrem', capacidade: '30 ton', rotas: 'Aparecida → Palmas', areas_atendidas: 'GO, TO', contato_publico: '(62) 99999-0000', perfil_profissional: 'Frotista', fonte: 'Site empresarial', score: 72, classificacao: 'PROVAVEL', status: 'NOVO', is_demo: true },
  ];

  for (const t of transportadores) {
    const { error } = await supabase.from('transportadores').insert(t);
    if (error) errors.push(`transportadores: ${error.message}`);
    else inserted++;
  }

  const oportunidades = [
    { empresa: '[DEMO] AgroSul Distribuidora', tipo: 'CARGA', cidade: 'Goiânia', estado: 'GO', segmento: 'Distribuidora', rota: 'Goiânia → Belém', tipo_carga: 'Alimentos', tipo_veiculo: 'Baú', capacidade: '12 ton', frequencia: 'Semanal', potencial: 'Alto', score: 75, classificacao: 'PROVAVEL', status: 'NOVA', evidencia: 'Site oficial', fonte: 'Google Maps', acao_recomendada: 'Verificar volume e frequência', is_demo: true },
    { empresa: '[DEMO] Cooperativa Grãos MT', tipo: 'EMBARCADOR', cidade: 'Cuiabá', estado: 'MT', segmento: 'Agronegócio', rota: 'Cuiabá → Santos', tipo_carga: 'Grãos', tipo_veiculo: 'Rodotrem', capacidade: '45 ton', frequencia: 'Semanal', potencial: 'Muito Alto', score: 85, classificacao: 'CONFIRMADA', status: 'QUALIFICADA', evidencia: 'Site da associação', fonte: 'Associação', acao_recomendada: 'Contato comercial', is_demo: true },
    { empresa: '[DEMO] Construtora Centro-Oeste', tipo: 'EMBARCADOR', cidade: 'Aparecida de Goiânia', estado: 'GO', segmento: 'Materiais de construção', rota: 'Aparecida → Palmas', tipo_carga: 'Material de construção', tipo_veiculo: 'Bitrem', capacidade: '30 ton', frequencia: 'Quinzenal', potencial: 'Alto', score: 80, classificacao: 'PROVAVEL', status: 'EM_ANALISE', evidencia: 'Página de contato', fonte: 'Site empresarial', acao_recomendada: 'Verificar volume', is_demo: true },
    { empresa: '[DEMO] Expresso Cerrado', tipo: 'TRANSPORTADOR', cidade: 'Goiânia', estado: 'GO', rota: 'Goiânia → Belém', tipo_carga: 'Alimentos', tipo_veiculo: 'Baú', capacidade: '12 ton', frequencia: 'Semanal', potencial: 'Médio', score: 70, classificacao: 'PROVAVEL', status: 'NOVA', evidencia: 'Google Maps', fonte: 'Google Maps', acao_recomendada: 'Verificar disponibilidade', is_demo: true },
    { empresa: '[DEMO] Atacadão Beira Rio', tipo: 'CARGA', cidade: 'Belém', estado: 'PA', segmento: 'Atacado', rota: 'Belém → Manaus', tipo_carga: 'Mistos', tipo_veiculo: 'Carreta LS', capacidade: '25 ton', frequencia: 'Semanal', potencial: 'Alto', score: 70, classificacao: 'PROVAVEL', status: 'NOVA', evidencia: 'Resultados de busca', fonte: 'Google', acao_recomendada: 'Verificar contato', is_demo: true },
  ];

  for (const o of oportunidades) {
    const { error } = await supabase.from('oportunidades').insert(o);
    if (error) errors.push(`oportunidades: ${error.message}`);
    else inserted++;
  }

  const leads = [
    { empresa: '[DEMO] AgroSul Distribuidora', pessoa: 'João Silva', telefone: '(62) 3000-0000', email: 'joao@exemplo.com', cidade: 'Goiânia', estado: 'GO', segmento: 'Distribuidora', origem: 'Radar de Cargas', rota: 'Goiânia → Belém', tipo_carga: 'Alimentos', potencial: 'Alto', score: 75, status: 'NOVO', prioridade: 'ALTA', proxima_acao: 'Ligar para João', is_demo: true },
    { empresa: '[DEMO] Cooperativa Grãos MT', pessoa: 'Pedro Santos', telefone: '(65) 3000-0000', email: 'pedro@exemplo.com', cidade: 'Cuiabá', estado: 'MT', segmento: 'Agronegócio', origem: 'Radar de Embarcadores', rota: 'Cuiabá → Santos', tipo_carga: 'Grãos', potencial: 'Muito Alto', score: 85, status: 'QUALIFICANDO', prioridade: 'PRIORIDADE_MAXIMA', proxima_acao: 'Enviar proposta', is_demo: true },
    { empresa: '[DEMO] Construtora Centro-Oeste', pessoa: 'Maria Costa', telefone: '(62) 3000-0001', email: 'maria@exemplo.com', cidade: 'Aparecida de Goiânia', estado: 'GO', segmento: 'Materiais de construção', origem: 'Radar de Embarcadores', rota: 'Aparecida → Palmas', tipo_carga: 'Material de construção', potencial: 'Alto', score: 80, status: 'CONTATO_REALIZADO', prioridade: 'ALTA', proxima_acao: 'Follow-up em 3 dias', is_demo: true },
    { empresa: '[DEMO] Expresso Cerrado', pessoa: 'Carlos Lima', telefone: '(62) 99999-0000', email: 'carlos@exemplo.com', cidade: 'Goiânia', estado: 'GO', segmento: 'Transportadora', origem: 'Radar de Transportadores', rota: 'Goiânia → Belém', tipo_carga: 'Alimentos', potencial: 'Médio', score: 70, status: 'NOVO', prioridade: 'MEDIA', proxima_acao: 'Verificar disponibilidade', is_demo: true },
    { empresa: '[DEMO] Atacadão Beira Rio', pessoa: 'Ana Oliveira', telefone: '(91) 3000-0000', email: 'ana@exemplo.com', cidade: 'Belém', estado: 'PA', segmento: 'Atacado', origem: 'Radar de Cargas', rota: 'Belém → Manaus', tipo_carga: 'Mistos', potencial: 'Alto', score: 70, status: 'NEGOCIACAO', prioridade: 'ALTA', proxima_acao: 'Negociar valores', is_demo: true },
  ];

  for (const l of leads) {
    const { error } = await supabase.from('leads').insert(l);
    if (error) errors.push(`leads: ${error.message}`);
    else inserted++;
  }

  const rotas = [
    { nome: '[DEMO] Goiânia → Belém', origem: 'Goiânia', destino: 'Belém', estado_origem: 'GO', estado_destino: 'PA', distancia_km: '2000', tipo_carga: 'Alimentos', tipo_veiculo: 'Baú', frequencia: 'Semanal', potencial: 'Alto', score: 75, status: 'ATIVO', is_demo: true },
    { nome: '[DEMO] Cuiabá → Santos', origem: 'Cuiabá', destino: 'Santos', estado_origem: 'MT', estado_destino: 'SP', distancia_km: '1700', tipo_carga: 'Grãos', tipo_veiculo: 'Rodotrem', frequencia: 'Semanal', potencial: 'Muito Alto', score: 85, status: 'ATIVO', is_demo: true },
    { nome: '[DEMO] Aparecida → Palmas', origem: 'Aparecida de Goiânia', destino: 'Palmas', estado_origem: 'GO', estado_destino: 'TO', distancia_km: '800', tipo_carga: 'Material de construção', tipo_veiculo: 'Bitrem', frequencia: 'Quinzenal', potencial: 'Alto', score: 80, status: 'ATIVO', is_demo: true },
    { nome: '[DEMO] Imperatriz → São Luís', origem: 'Imperatriz', destino: 'São Luís', estado_origem: 'MA', estado_destino: 'MA', distancia_km: '600', tipo_carga: 'Alimentos', tipo_veiculo: 'Truck', frequencia: 'Diário', potencial: 'Médio', score: 65, status: 'ATIVO', is_demo: true },
    { nome: '[DEMO] Belém → Manaus', origem: 'Belém', destino: 'Manaus', estado_origem: 'PA', estado_destino: 'AM', distancia_km: '1500', tipo_carga: 'Mistos', tipo_veiculo: 'Carreta LS', frequencia: 'Semanal', potencial: 'Alto', score: 70, status: 'ATIVO', is_demo: true },
  ];

  for (const r of rotas) {
    const { error } = await supabase.from('rotas').insert(r);
    if (error) errors.push(`rotas: ${error.message}`);
    else inserted++;
  }

  return { inserted, errors };
}

export async function removeDemoData(): Promise<{ removed: number; errors: string[] }> {
  let removed = 0;
  const errors: string[] = [];
  const tables = ['cargas', 'embarcadores', 'transportadores', 'leads', 'oportunidades', 'empresas', 'rotas'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).delete().eq('is_demo', true).select('id');
    if (error) errors.push(`${table}: ${error.message}`);
    else removed += data?.length ?? 0;
  }

  return { removed, errors };
}

export async function hasDemoData(): Promise<boolean> {
  const { count } = await supabase.from('cargas').select('*', { count: 'exact', head: true }).eq('is_demo', true);
  return (count ?? 0) > 0;
}
