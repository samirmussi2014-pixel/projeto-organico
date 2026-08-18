import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { sendOmnichannel } from './omnichannel.js';

const ROUTES = [
  { origem: 'Goiânia', destino: 'Belém', estado_origem: 'GO', estado_destino: 'PA', tipo_carga: 'Alimentos', tipo_veiculo: 'Baú', frequencia: 'Semanal', capacidade: '12 ton' },
  { origem: 'Cuiabá', destino: 'Santos', estado_origem: 'MT', estado_destino: 'SP', tipo_carga: 'Grãos', tipo_veiculo: 'Rodotrem', frequencia: 'Semanal', capacidade: '35 ton' },
  { origem: 'Aparecida de Goiânia', destino: 'Palmas', estado_origem: 'GO', estado_destino: 'TO', tipo_carga: 'Material de construção', tipo_veiculo: 'Bitrem', frequencia: 'Quinzenal', capacidade: '30 ton' },
  { origem: 'Imperatriz', destino: 'São Luís', estado_origem: 'MA', estado_destino: 'MA', tipo_carga: 'Alimentos', tipo_veiculo: 'Truck', frequencia: 'Diária', capacidade: '8 ton' },
  { origem: 'Belém', destino: 'Manaus', estado_origem: 'PA', estado_destino: 'AM', tipo_carga: 'Mistos', tipo_veiculo: 'Carreta LS', frequencia: 'Semanal', capacidade: '20 ton' },
];

const COMPANY_NAMES = [
  'AgroSul Logística', 'Grupo Vale do Cerrado', 'Norte Brasil Transportes', 'Rota Verde Fretes',
  'Cia. do Transporte', 'Prime Cargo Express', 'Transcooperativa do Oeste', 'Mercado Norte Distribuição',
  'Frete Forte Brasil', 'Logística Centro Oeste', 'Atacadista Sul Norte', 'Cadeia Integral Logística'
];

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
}

export function getSupabaseClient() {
  loadDotEnv();

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase env vars. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or SUPABASE_URL / SUPABASE_ANON_KEY.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getMode(client) {
  const { data, error } = await client
    .from('app_settings')
    .select('modo_operacao')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read app settings: ${error.message}`);
  }

  return (data?.modo_operacao || 'OBSERVACAO');
}

async function recordAutomationRun(client, {
  source,
  mode,
  status,
  counts = {},
  generated = {},
  notification = null,
  erro = null,
}) {
  const summary = notification?.summary || {};
  const payload = {
    source,
    mode,
    status,
    leads: counts.leads ?? 0,
    cargas: counts.cargas ?? 0,
    oportunidades: counts.oportunidades ?? 0,
    palavras_chave: counts.palavras_chave ?? 0,
    oportunidades_geradas: generated.opportunities ?? 0,
    conteudos_gerados: generated.contents ?? 0,
    palavras_processadas: generated.keywords ?? 0,
    whatsapp_enviados: summary.sent ?? 0,
    whatsapp_falhos: summary.failed ?? 0,
    whatsapp_pulados: summary.skipped ?? 0,
    erro,
  };

  const { error } = await client.from('automation_runs').insert(payload);
  if (error) {
    console.warn('Automation telemetry failed:', error.message);
  }
}

/**
 * Backward compatibility: send to all configured channels
 */
export async function sendWhatsAppNotification({
  phone,
  message,
  dryRun = false,
} = {}) {
  return sendOmnichannel({
    phone: phone || process.env.WHATSAPP_TO,
    instagramRecipientId: process.env.INSTAGRAM_RECIPIENT_ID,
    facebookRecipientId: process.env.FACEBOOK_RECIPIENT_ID,
    message,
    dryRun,
    channels: ['whatsapp', 'instagram', 'facebook'],
  });
}

function pickRoute(index) {
  return ROUTES[index % ROUTES.length];
}

function buildOpportunityForKeyword(keyword, index = 0) {
  const route = pickRoute(index);
  const company = COMPANY_NAMES[index % COMPANY_NAMES.length];
  const score = 72 + ((index + keyword.length) % 20);

  return {
    empresa: company,
    tipo: 'CARGA',
    cidade: route.origem,
    estado: route.estado_origem,
    segmento: 'Distribuidora',
    rota: `${route.origem} → ${route.destino}`,
    tipo_carga: route.tipo_carga,
    tipo_veiculo: route.tipo_veiculo,
    capacidade: route.capacidade,
    frequencia: route.frequencia,
    potencial: score >= 85 ? 'Muito Alto' : score >= 75 ? 'Alto' : 'Médio',
    score,
    classificacao: score >= 80 ? 'PROVAVEL' : 'NAO CONFIRMADA',
    status: 'NOVA',
    evidencia: `Palavra-chave ativa: ${keyword} | automação de prospecção`,
    fonte: 'Automação do sistema',
    acao_recomendada: `Verificar demanda para ${keyword.toLowerCase()} e fechar rota ${route.origem} → ${route.destino}`,
    origem_tipo: 'automacao',
    origem_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildContentForKeyword(keyword, index = 0) {
  const route = pickRoute(index);
  const title = `Conteúdo para ${keyword} em ${route.origem} → ${route.destino}`;
  return {
    titulo: title,
    assunto: `Prospectar clientes para ${route.tipo_carga.toLowerCase()} na rota ${route.origem} → ${route.destino}`,
    palavra_chave: keyword,
    cidade: route.origem,
    estado: route.estado_origem,
    segmento: 'Distribuidora',
    rota: `${route.origem} → ${route.destino}`,
    tipo: 'Artigo',
    status: 'RASCUNHO',
    data: new Date().toISOString().slice(0, 10),
    conteudo: `A demanda por ${keyword.toLowerCase()} na rota ${route.origem} → ${route.destino} exige abordagem comercial direta, foco em ${route.tipo_carga.toLowerCase()} e proposta com ritmo ${route.frequencia.toLowerCase()}. Criar CTA para qualificação e acompanhamento comercial.`,
    cta: 'Solicite proposta comercial',
    created_at: new Date().toISOString(),
  };
}

async function getActiveKeywords(client) {
  const { data, error } = await client
    .from('palavras_chave')
    .select('termo')
    .eq('ativa', true)
    .limit(10);

  if (error) throw new Error(`Failed to fetch active keywords: ${error.message}`);
  return (data ?? []).map((row) => row.termo).filter(Boolean);
}

async function createAutomationRecords(client, mode) {
  const keywords = await getActiveKeywords(client);
  const insertedOpportunities = [];
  const insertedContents = [];

  if (!keywords.length) {
    return { opportunities: 0, contents: 0, keywords: 0 };
  }

  for (let i = 0; i < keywords.length; i += 1) {
    const keyword = keywords[i];
    const opportunity = buildOpportunityForKeyword(keyword, i);
    const content = buildContentForKeyword(keyword, i);

    const { data: existingOpportunityData } = await client
      .from('oportunidades')
      .select('id')
      .ilike('evidencia', `%${keyword}%`)
      .limit(1)
      .maybeSingle();

    if (!existingOpportunityData) {
      const { error: oppError } = await client.from('oportunidades').insert(opportunity);
      if (!oppError) insertedOpportunities.push(opportunity);
    }

    if (mode === 'AUTONOMO') {
      const { data: existingContentData } = await client
        .from('conteudos')
        .select('id')
        .ilike('titulo', `%${keyword}%`)
        .limit(1)
        .maybeSingle();

      if (!existingContentData) {
        const { error: contentError } = await client.from('conteudos').insert(content);
        if (!contentError) insertedContents.push(content);
      }
    }
  }

  return {
    opportunities: insertedOpportunities.length,
    contents: insertedContents.length,
    keywords: keywords.length,
  };
}

export async function runAutomationCycle({ source = 'manual', dryRun = false } = {}) {
  const client = getSupabaseClient();
  const mode = await getMode(client);

  const result = {
    source,
    mode,
    timestamp: new Date().toISOString(),
    status: 'skipped',
    counts: {},
    webhook: null,
  };

  if (mode === 'OBSERVACAO') {
    result.reason = 'Sistema em modo observação; automações não executam.';
    await recordAutomationRun(client, {
      source,
      mode,
      status: 'skipped',
      counts: {},
      generated: {},
    });
    return result;
  }

  const [leadsRes, cargasRes, palavrasRes, opportunitiesRes] = await Promise.all([
    client.from('leads').select('id', { count: 'exact', head: true }),
    client.from('cargas').select('id', { count: 'exact', head: true }),
    client.from('palavras_chave').select('id', { count: 'exact', head: true }),
    client.from('oportunidades').select('id', { count: 'exact', head: true }),
  ]);

  if (leadsRes.error) throw new Error(`Leads query failed: ${leadsRes.error.message}`);
  if (cargasRes.error) throw new Error(`Cargas query failed: ${cargasRes.error.message}`);
  if (palavrasRes.error) throw new Error(`Palavras-chave query failed: ${palavrasRes.error.message}`);
  if (opportunitiesRes.error) throw new Error(`Oportunidades query failed: ${opportunitiesRes.error.message}`);

  result.counts = {
    leads: leadsRes.count ?? 0,
    cargas: cargasRes.count ?? 0,
    oportunidades: opportunitiesRes.count ?? 0,
    palavras_chave: palavrasRes.count ?? 0,
  };

  const payload = {
    data: new Date().toISOString().slice(0, 10),
    metrica: 'automation_heartbeat',
    valor: 1,
    observacoes: `source=${source}; mode=${mode}; leads=${result.counts.leads}; cargas=${result.counts.cargas}; oportunidades=${result.counts.oportunidades}; palavras=${result.counts.palavras_chave}`,
  };

  if (!dryRun) {
    const { error: metricError } = await client.from('metrics').insert(payload);
    if (metricError) {
      throw new Error(`Failed to insert automation metric: ${metricError.message}`);
    }

    const generated = await createAutomationRecords(client, mode);
    result.generated = generated;
    result.status = 'ok';
  } else {
    result.generated = await createAutomationRecords(client, mode)
      .then((data) => data)
      .catch(() => ({ opportunities: 0, contents: 0, keywords: 0 }));
    result.status = 'dry-run';
  }

  const notificationText = `Mussi Fretes: automação ${source} concluída. Modo ${mode}. Leads ${result.counts.leads} | Cargas ${result.counts.cargas} | Oportunidades ${result.counts.oportunidades}.`;
  result.notification = await sendWhatsAppNotification({
    phone: process.env.WHATSAPP_TO || '(62) 986369013',
    message: notificationText,
    dryRun: Boolean(dryRun),
  });

  const webhookUrl = process.env.AUTOMATION_WEBHOOK_URL;
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        mode,
        counts: result.counts,
        generated: result.generated,
        timestamp: result.timestamp,
      }),
    });

    const text = await response.text();
    result.webhook = {
      status: response.status,
      ok: response.ok,
      body: text,
      url: webhookUrl,
    };
  }

  await recordAutomationRun(client, {
    source,
    mode,
    status: result.status,
    counts: result.counts,
    generated: result.generated,
    notification: result.notification,
  });

  return result;
}

export function startScheduler({ intervalMinutes = 5 } = {}) {
  const intervalMs = intervalMinutes * 60 * 1000;
  console.log(`Automation scheduler started. Next run every ${intervalMinutes} minutes.`);

  const run = async () => {
    try {
      const result = await runAutomationCycle({ source: 'scheduler' });
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Automation cycle failed:', message);
      try {
        const client = getSupabaseClient();
        const mode = await getMode(client).catch(() => 'UNKNOWN');
        await recordAutomationRun(client, {
          source: 'scheduler',
          mode,
          status: 'error',
          erro: message,
        });
      } catch (telemetryError) {
        console.error('Automation error telemetry failed:', telemetryError instanceof Error ? telemetryError.message : telemetryError);
      }
    }
  };

  run();
  return setInterval(run, intervalMs);
}
