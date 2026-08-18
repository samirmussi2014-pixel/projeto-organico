import { useEffect, useState } from 'react';
import {
  Calendar, Target, Building2, Truck, Package, Route,
  Star, FileText, Tag, TrendingUp, AlertTriangle, ArrowRight,
  CheckCircle, Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SectionCard, StatCard, EmptyState } from '@/components/ui/Cards';
import { ScoreBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Form';
import { statusColor, formatDate } from '@/lib/constants';

interface DailyData {
  leads: number;
  embarcadores: number;
  transportadores: number;
  cargas: number;
  rotas: number;
  oportunidades: number;
  conteudos: number;
  palavrasChave: number;
}

interface TopItem {
  id: string;
  empresa: string;
  cidade: string;
  estado: string;
  score: number;
  status: string;
}

export function RelatorioDiarioPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DailyData | null>(null);
  const [topOportunidades, setTopOportunidades] = useState<TopItem[]>([]);
  const [topLeads, setTopLeads] = useState<TopItem[]>([]);
  const [palavras, setPalavras] = useState<{ id: string; termo: string; categoria: string }[]>([]);
  const [resultados, setResultados] = useState('');
  const [problemas, setProblemas] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function load() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startISO = startOfDay.toISOString();

      const tables = ['leads', 'embarcadores', 'transportadores', 'cargas', 'rotas', 'oportunidades', 'conteudos'];
      const counts = await Promise.all(
        tables.map((t) =>
          supabase.from(t).select('*', { count: 'exact', head: true }).gte('created_at', startISO)
        )
      );
      const palavrasRes = await supabase.from('palavras_chave').select('*', { count: 'exact', head: true });

      const oportRes = await supabase
        .from('oportunidades')
        .select('id, empresa, cidade, estado, score, status')
        .order('score', { ascending: false })
        .limit(5);

      const leadsRes = await supabase
        .from('leads')
        .select('id, empresa, cidade, estado, score, status')
        .order('score', { ascending: false })
        .limit(5);

      const palavrasList = await supabase.from('palavras_chave').select('id, termo, categoria').limit(20);

      const metricsRes = await supabase
        .from('metrics')
        .select('metrica, valor, observacoes')
        .eq('data', today)
        .in('metrica', ['relatorio_diario_resultado', 'relatorio_diario_problemas', 'relatorio_diario_proxima_acao']);

      const metricsMap: Record<string, string> = {};
      for (const m of metricsRes.data ?? []) {
        metricsMap[(m as { metrica: string; observacoes: string }).metrica] = (m as { observacoes: string }).observacoes ?? '';
      }

      setData({
        leads: counts[0].count ?? 0,
        embarcadores: counts[1].count ?? 0,
        transportadores: counts[2].count ?? 0,
        cargas: counts[3].count ?? 0,
        rotas: counts[4].count ?? 0,
        oportunidades: counts[5].count ?? 0,
        conteudos: counts[6].count ?? 0,
        palavrasChave: palavrasRes.count ?? 0,
      });
      setTopOportunidades((oportRes.data ?? []) as TopItem[]);
      setTopLeads((leadsRes.data ?? []) as TopItem[]);
      setPalavras((palavrasList.data ?? []) as { id: string; termo: string; categoria: string }[]);
      setResultados(metricsMap['relatorio_diario_resultado'] ?? '');
      setProblemas(metricsMap['relatorio_diario_problemas'] ?? '');
      setProximaAcao(metricsMap['relatorio_diario_proxima_acao'] ?? '');
      setLoading(false);
    }
    load();
  }, [today]);

  async function saveReport() {
    setSaving(true);
    const entries = [
      { metrica: 'relatorio_diario_resultado', observacoes: resultados },
      { metrica: 'relatorio_diario_problemas', observacoes: problemas },
      { metrica: 'relatorio_diario_proxima_acao', observacoes: proximaAcao },
    ];
    for (const entry of entries) {
      const { data: existing } = await supabase
        .from('metrics')
        .select('id')
        .eq('data', today)
        .eq('metrica', entry.metrica)
        .maybeSingle();
      if (existing) {
        await supabase.from('metrics').update({ observacoes: entry.observacoes }).eq('id', (existing as { id: string }).id);
      } else {
        await supabase.from('metrics').insert({ data: today, metrica: entry.metrica, valor: 0, observacoes: entry.observacoes });
      }
    }
    setSaving(false);
  }

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Calendar className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Relatório Diário</h2>
          <p className="text-sm text-slate-400">{formatDate(today)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <StatCard label="Novos Leads" value={data.leads} icon={<Target className="h-4 w-4" />} accent="blue" />
        <StatCard label="Embarcadores" value={data.embarcadores} icon={<Building2 className="h-4 w-4" />} accent="amber" />
        <StatCard label="Transportadores" value={data.transportadores} icon={<Truck className="h-4 w-4" />} accent="teal" />
        <StatCard label="Cargas" value={data.cargas} icon={<Package className="h-4 w-4" />} accent="violet" />
        <StatCard label="Rotas" value={data.rotas} icon={<Route className="h-4 w-4" />} accent="orange" />
        <StatCard label="Oportunidades" value={data.oportunidades} icon={<Star className="h-4 w-4" />} accent="rose" />
        <StatCard label="Conteúdos" value={data.conteudos} icon={<FileText className="h-4 w-4" />} accent="violet" />
        <StatCard label="Palavras-chave" value={data.palavrasChave} icon={<Tag className="h-4 w-4" />} accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="TOP 5 Oportunidades">
          {topOportunidades.length === 0 ? (
            <EmptyState title="Nenhuma oportunidade encontrada" />
          ) : (
            <div className="space-y-2">
              {topOportunidades.map((o, i) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{o.empresa || '-'}</p>
                    <p className="text-xs text-slate-400">{o.cidade}/{o.estado}</p>
                  </div>
                  <Badge className={statusColor(o.status)}>{o.status}</Badge>
                  <ScoreBadge score={o.score} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Melhores Leads">
          {topLeads.length === 0 ? (
            <EmptyState title="Nenhum lead encontrado" />
          ) : (
            <div className="space-y-2">
              {topLeads.map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{l.empresa || '-'}</p>
                    <p className="text-xs text-slate-400">{l.cidade}/{l.estado}</p>
                  </div>
                  <Badge className={statusColor(l.status)}>{l.status}</Badge>
                  <ScoreBadge score={l.score} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Palavras-chave Encontradas">
        {palavras.length === 0 ? (
          <EmptyState title="Nenhuma palavra-chave cadastrada" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {palavras.map((p) => (
              <Badge key={p.id} className="text-slate-600 bg-slate-50 border-slate-200">
                {p.termo}
                {p.categoria && <span className="ml-1 text-slate-400">· {p.categoria}</span>}
              </Badge>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Resultados">
          <textarea
            value={resultados}
            onChange={(e) => setResultados(e.target.value)}
            rows={5}
            placeholder="Registre os resultados do dia..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </SectionCard>
        <SectionCard title="Problemas">
          <textarea
            value={problemas}
            onChange={(e) => setProblemas(e.target.value)}
            rows={5}
            placeholder="Registre os problemas encontrados..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </SectionCard>
        <SectionCard title="Próxima Ação">
          <textarea
            value={proximaAcao}
            onChange={(e) => setProximaAcao(e.target.value)}
            rows={5}
            placeholder="Defina a próxima ação..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveReport} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Relatório'}
        </Button>
      </div>
    </div>
  );
}
