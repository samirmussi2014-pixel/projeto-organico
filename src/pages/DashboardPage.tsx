import { useEffect, useState } from 'react';
import {
  Target, Building2, Truck, Users, Package, Route, Star,
  Mail, MessageSquare, UserCheck, Handshake, FileText,
  TrendingUp, DollarSign, Radar, Eye, ArrowRight,
  Activity, Send, RefreshCw, CheckCircle2, AlertTriangle, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StatCard, SectionCard, EmptyState } from '@/components/ui/Cards';
import { ScoreBadge, Badge } from '@/components/ui/Badge';
import { scoreColor, statusColor, formatDate } from '@/lib/constants';
import type { PageId } from '@/components/Layout';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

interface AutomationRun {
  id: string;
  source: string;
  mode: string;
  status: string;
  leads: number;
  cargas: number;
  oportunidades: number;
  palavras_chave: number;
  oportunidades_geradas: number;
  conteudos_gerados: number;
  palavras_processadas: number;
  whatsapp_enviados: number;
  whatsapp_falhos: number;
  whatsapp_pulados: number;
  erro: string | null;
  created_at: string;
}

interface Counts {
  leads: number;
  embarcadores: number;
  transportadores: number;
  cargas: number;
  rotas: number;
  oportunidades: number;
  contacts: number;
  interactions: number;
  empresas: number;
  conteudos: number;
  tarefasPendentes: number;
  oportunidadesConfirmadas: number;
}

export function DashboardPage({ onNavigate }: DashboardProps) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [topOportunidades, setTopOportunidades] = useState<
    { id: string; empresa: string; tipo: string; cidade: string; estado: string; score: number; status: string }[]
  >([]);
  const [topLeads, setTopLeads] = useState<
    { id: string; empresa: string; cidade: string; estado: string; score: number; status: string }[]
  >([]);
  const [tarefas, setTarefas] = useState<
    { id: string; titulo: string; prioridade: string; status: string; prazo: string | null }[]
  >([]);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);
  const [automationRunsTotal, setAutomationRunsTotal] = useState(0);
  const [whatsappSentTotal, setWhatsappSentTotal] = useState(0);
  const [automationRunsError, setAutomationRunsError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const tables = [
        'leads', 'embarcadores', 'transportadores', 'cargas',
        'rotas', 'oportunidades', 'contacts', 'interactions',
        'empresas', 'conteudos',
      ];
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true }))
      );

      const tarefasRes = await supabase
        .from('tarefas')
        .select('id, titulo, prioridade, status, prazo')
        .eq('status', 'PENDENTE')
        .order('prazo', { ascending: true, nullsFirst: false })
        .limit(5);

      const oportRes = await supabase
        .from('oportunidades')
        .select('id, empresa, tipo, cidade, estado, score, status')
        .order('score', { ascending: false })
        .limit(5);

      const leadsRes = await supabase
        .from('leads')
        .select('id, empresa, cidade, estado, score, status')
        .order('score', { ascending: false })
        .limit(5);

      const oportConfirmadas = await supabase
        .from('oportunidades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CONFIRMADA');

      const runsRes = await supabase
        .from('automation_runs')
        .select(
          'id, source, mode, status, leads, cargas, oportunidades, palavras_chave, oportunidades_geradas, conteudos_gerados, palavras_processadas, whatsapp_enviados, whatsapp_falhos, whatsapp_pulados, erro, created_at'
        )
        .order('created_at', { ascending: false })
        .limit(10);

      const runTotalsRes = await supabase
        .from('automation_runs')
        .select('whatsapp_enviados, whatsapp_falhos, whatsapp_pulados');

      if (runsRes.error || runTotalsRes.error) {
        setAutomationRunsError('Histórico da automação ainda não está disponível. Execute a nova migration do painel.');
      } else {
        const totals = runTotalsRes.data ?? [];
        setAutomationRuns((runsRes.data ?? []) as AutomationRun[]);
        setAutomationRunsTotal(totals.length);
        setWhatsappSentTotal(totals.reduce((sum, row) => sum + (row.whatsapp_enviados || 0), 0));
      }

      setCounts({
        leads: results[0].count ?? 0,
        embarcadores: results[1].count ?? 0,
        transportadores: results[2].count ?? 0,
        cargas: results[3].count ?? 0,
        rotas: results[4].count ?? 0,
        oportunidades: results[5].count ?? 0,
        contacts: results[6].count ?? 0,
        interactions: results[7].count ?? 0,
        empresas: results[8].count ?? 0,
        conteudos: results[9].count ?? 0,
        tarefasPendentes: tarefasRes.count ?? 0,
        oportunidadesConfirmadas: oportConfirmadas.count ?? 0,
      });
      setTarefas((tarefasRes.data ?? []) as typeof tarefas);
      setTopOportunidades((oportRes.data ?? []) as typeof topOportunidades);
      setTopLeads((leadsRes.data ?? []) as typeof topLeads);
    }
    load();
  }, []);

  if (!counts) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cost banner */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Custo Operacional</span>
        </div>
        <span className="text-xl font-bold text-emerald-700">R$ 0,00</span>
      </div>

      {/* Automation control center */}
      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/10 p-2">
                <Activity className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Central de Automação</p>
                <h2 className="text-lg font-bold">Acompanhamento em tempo real</h2>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              O painel acompanha as execuções registradas pelo scheduler, os resultados gerados e os envios do WhatsApp.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {automationRuns[0]?.status === 'ok' ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Automação saudável
              </span>
            ) : automationRuns[0]?.status === 'error' ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-200">
                <AlertTriangle className="h-3.5 w-3.5" /> Última execução com erro
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
                <Clock className="h-3.5 w-3.5" /> Aguardando execução
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
              <RefreshCw className="h-3.5 w-3.5" /> A cada 5 min
            </span>
          </div>
        </div>

        {automationRunsError ? (
          <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {automationRunsError}
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <AutomationMetric label="Execuções totais" value={automationRunsTotal} />
              <AutomationMetric label="Leads lidos" value={automationRuns[0]?.leads ?? counts.leads} />
              <AutomationMetric label="Cargas lidas" value={automationRuns[0]?.cargas ?? counts.cargas} />
              <AutomationMetric label="Oport. geradas" value={automationRuns[0]?.oportunidades_geradas ?? 0} />
              <AutomationMetric label="Conteúdos gerados" value={automationRuns[0]?.conteudos_gerados ?? 0} />
              <AutomationMetric label="WhatsApp enviados" value={whatsappSentTotal} icon={<Send className="h-3.5 w-3.5 text-emerald-300" />} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Últimas execuções</p>
                    <p className="text-xs text-slate-400">Histórico gravado em automation_runs</p>
                  </div>
                  {automationRuns[0] && (
                    <span className="text-xs text-slate-400">
                      Última: {new Date(automationRuns[0].created_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
                {automationRuns.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    Nenhuma execução registrada ainda. O próximo ciclo aparecerá aqui.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {automationRuns.slice(0, 6).map((run) => (
                      <div key={run.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 sm:grid-cols-[1.1fr_0.7fr_0.7fr_auto]">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-100">{new Date(run.created_at).toLocaleString('pt-BR')}</p>
                          <p className="text-xs text-slate-500">{run.source} · {run.mode}</p>
                        </div>
                        <div className="hidden text-xs text-slate-300 sm:block">{run.oportunidades_geradas} oportunidades</div>
                        <div className="hidden text-xs text-slate-300 sm:block">{run.whatsapp_enviados} WhatsApp</div>
                        <span className={`inline-flex h-fit items-center justify-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                          run.status === 'ok' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200'
                        }`}>
                          {run.status === 'ok' ? 'OK' : 'ERRO'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold">Último ciclo</p>
                {automationRuns[0] ? (
                  <div className="mt-4 space-y-3 text-sm">
                    <MetricLine label="Modo" value={automationRuns[0].mode} />
                    <MetricLine label="Leads" value={automationRuns[0].leads} />
                    <MetricLine label="Cargas" value={automationRuns[0].cargas} />
                    <MetricLine label="Oportunidades existentes" value={automationRuns[0].oportunidades} />
                    <MetricLine label="Oportunidades geradas" value={automationRuns[0].oportunidades_geradas} />
                    <MetricLine label="Conteúdos gerados" value={automationRuns[0].conteudos_gerados} />
                    <MetricLine label="Palavras processadas" value={automationRuns[0].palavras_processadas} />
                    <MetricLine label="WhatsApp enviados" value={automationRuns[0].whatsapp_enviados} />
                    {automationRuns[0].erro && (
                      <div className="rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{automationRuns[0].erro}</div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">Ainda não há um ciclo registrado.</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Leads" value={counts.leads} icon={<Target className="h-4 w-4" />} accent="blue" />
        <StatCard label="Embarcadores" value={counts.embarcadores} icon={<Building2 className="h-4 w-4" />} accent="amber" />
        <StatCard label="Transportadores" value={counts.transportadores} icon={<Truck className="h-4 w-4" />} accent="teal" />
        <StatCard label="Cargas" value={counts.cargas} icon={<Package className="h-4 w-4" />} accent="violet" />
        <StatCard label="Rotas" value={counts.rotas} icon={<Route className="h-4 w-4" />} accent="orange" />
        <StatCard label="Oportunidades" value={counts.oportunidades} icon={<Star className="h-4 w-4" />} accent="rose" />
        <StatCard label="Contatos" value={counts.contacts} icon={<Mail className="h-4 w-4" />} accent="blue" />
        <StatCard label="Respostas" value={counts.interactions} icon={<MessageSquare className="h-4 w-4" />} accent="emerald" />
        <StatCard label="Empresas" value={counts.empresas} icon={<Building2 className="h-4 w-4" />} accent="slate" />
        <StatCard label="Conteúdos" value={counts.conteudos} icon={<FileText className="h-4 w-4" />} accent="violet" />
        <StatCard label="Tarefas Pendentes" value={counts.tarefasPendentes} icon={<UserCheck className="h-4 w-4" />} accent="amber" />
        <StatCard label="Oport. Confirmadas" value={counts.oportunidadesConfirmadas} icon={<Handshake className="h-4 w-4" />} accent="emerald" />
      </div>

      {/* Radar cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RadarCard
          title="Radar de Cargas"
          icon={<Radar className="h-5 w-5" />}
          count={counts.cargas}
          accent="violet"
          onClick={() => onNavigate('radar-cargas')}
        />
        <RadarCard
          title="Radar de Embarcadores"
          icon={<Building2 className="h-5 w-5" />}
          count={counts.embarcadores}
          accent="amber"
          onClick={() => onNavigate('radar-embarcadores')}
        />
        <RadarCard
          title="Radar de Transportadores"
          icon={<Truck className="h-5 w-5" />}
          count={counts.transportadores}
          accent="teal"
          onClick={() => onNavigate('radar-transportadores')}
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Oportunidades Prioritárias"
          action={
            <button
              onClick={() => onNavigate('oportunidades')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {topOportunidades.length === 0 ? (
            <EmptyState title="Nenhuma oportunidade cadastrada" />
          ) : (
            <div className="space-y-2">
              {topOportunidades.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{o.empresa || '-'}</p>
                    <p className="text-xs text-slate-400">
                      {o.tipo} · {o.cidade}/{o.estado}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(o.status)}>{o.status}</Badge>
                    <ScoreBadge score={o.score} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Leads de Alta Prioridade"
          action={
            <button
              onClick={() => onNavigate('leads')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {topLeads.length === 0 ? (
            <EmptyState title="Nenhum lead cadastrado" />
          ) : (
            <div className="space-y-2">
              {topLeads.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{l.empresa || '-'}</p>
                    <p className="text-xs text-slate-400">
                      {l.cidade}/{l.estado}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(l.status)}>{l.status}</Badge>
                    <ScoreBadge score={l.score} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Tasks + weekly evolution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Tarefas Pendentes"
          action={
            <button
              onClick={() => onNavigate('tarefas')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {tarefas.length === 0 ? (
            <EmptyState title="Nenhuma tarefa pendente" />
          ) : (
            <div className="space-y-2">
              {tarefas.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-700">{t.titulo}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={scoreColor(t.prioridade === 'ALTA' ? 90 : t.prioridade === 'MEDIA' ? 50 : 20)}>
                      {t.prioridade}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatDate(t.prazo)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Evolução Semanal">
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <TrendingUp className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">
                Dados de evolução aparecerão conforme o sistema for alimentado.
              </p>
              <button
                onClick={() => onNavigate('relatorio-semanal')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Ver relatório semanal <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        <Eye className="h-3.5 w-3.5" />
        Sistema em modo observação. Nenhuma ação externa será executada sem autorização.
      </div>
    </div>
  );
}

function AutomationMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</p>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function RadarCard({
  title,
  icon,
  count,
  accent,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  accent: string;
  onClick: () => void;
}) {
  const accents: Record<string, string> = {
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
    teal: 'from-teal-500 to-teal-600',
  };
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-sm`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{count}</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-400" />
    </button>
  );
}
