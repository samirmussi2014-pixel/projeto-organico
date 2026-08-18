import { useEffect, useState, useMemo } from 'react';
import {
  Calendar, TrendingUp, TrendingDown, Target, FileText,
  Star, Lightbulb, Save, BarChart3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SectionCard, StatCard, EmptyState } from '@/components/ui/Cards';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Form';
import { formatDate } from '@/lib/constants';

interface WeekCounts {
  leads: number;
  oportunidades: number;
  cargas: number;
  embarcadores: number;
  transportadores: number;
  conteudos: number;
}

interface GroupCount {
  key: string;
  count: number;
}

export function RelatorioSemanalPage() {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<WeekCounts | null>(null);
  const [previous, setPrevious] = useState<WeekCounts | null>(null);
  const [topLeads, setTopLeads] = useState<{ id: string; empresa: string; cidade: string; estado: string; score: number }[]>([]);
  const [topConteudos, setTopConteudos] = useState<{ id: string; titulo: string; tipo: string }[]>([]);
  const [melhoresCidades, setMelhoresCidades] = useState<GroupCount[]>([]);
  const [melhoresEstados, setMelhoresEstados] = useState<GroupCount[]>([]);
  const [melhoresSegmentos, setMelhoresSegmentos] = useState<GroupCount[]>([]);
  const [conclusao, setConclusao] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const weekStartISO = weekAgo.toISOString();
  const twoWeeksAgoISO = twoWeeksAgo.toISOString();
  const today = now.toISOString().split('T')[0];

  useEffect(() => {
    async function load() {
      const tables = ['leads', 'oportunidades', 'cargas', 'embarcadores', 'transportadores', 'conteudos'];

      const currentCounts = await Promise.all(
        tables.map((t) =>
          supabase.from(t).select('*', { count: 'exact', head: true }).gte('created_at', weekStartISO)
        )
      );
      const previousCounts = await Promise.all(
        tables.map((t) =>
          supabase
            .from(t)
            .select('*', { count: 'exact', head: true })
            .gte('created_at', twoWeeksAgoISO)
            .lt('created_at', weekStartISO)
        )
      );

      setCurrent({
        leads: currentCounts[0].count ?? 0,
        oportunidades: currentCounts[1].count ?? 0,
        cargas: currentCounts[2].count ?? 0,
        embarcadores: currentCounts[3].count ?? 0,
        transportadores: currentCounts[4].count ?? 0,
        conteudos: currentCounts[5].count ?? 0,
      });
      setPrevious({
        leads: previousCounts[0].count ?? 0,
        oportunidades: previousCounts[1].count ?? 0,
        cargas: previousCounts[2].count ?? 0,
        embarcadores: previousCounts[3].count ?? 0,
        transportadores: previousCounts[4].count ?? 0,
        conteudos: previousCounts[5].count ?? 0,
      });

      const leadsRes = await supabase
        .from('leads')
        .select('id, empresa, cidade, estado, score')
        .gte('created_at', weekStartISO)
        .order('score', { ascending: false })
        .limit(5);
      setTopLeads((leadsRes.data ?? []) as typeof topLeads);

      const conteudosRes = await supabase
        .from('conteudos')
        .select('id, titulo, tipo')
        .gte('created_at', weekStartISO)
        .order('created_at', { ascending: false })
        .limit(3);
      setTopConteudos((conteudosRes.data ?? []) as typeof topConteudos);

      // Group leads+oportunidades by cidade, estado, segmento
      const [leadsData, oportData] = await Promise.all([
        supabase.from('leads').select('cidade, estado, segmento').gte('created_at', weekStartISO),
        supabase.from('oportunidades').select('cidade, estado, segmento').gte('created_at', weekStartISO),
      ]);

      const allRows = [...(leadsData.data ?? []), ...(oportData.data ?? [])] as { cidade: string; estado: string; segmento: string }[];

      setMelhoresCidades(groupBy(allRows, 'cidade'));
      setMelhoresEstados(groupBy(allRows, 'estado'));
      setMelhoresSegmentos(groupBy(allRows, 'segmento'));

      const metricsRes = await supabase
        .from('metrics')
        .select('observacoes')
        .eq('data', today)
        .eq('metrica', 'relatorio_semanal_conclusao')
        .maybeSingle();
      if (metricsRes.data) {
        setConclusao((metricsRes.data as { observacoes: string }).observacoes ?? '');
      }

      setLoading(false);
    }
    load();
  }, [weekStartISO, twoWeeksAgoISO, today]);

  function groupBy(rows: { cidade: string; estado: string; segmento: string }[], key: 'cidade' | 'estado' | 'segmento'): GroupCount[] {
    const map = new Map<string, number>();
    for (const r of rows) {
      const val = r[key];
      if (val && val.trim()) {
        map.set(val, (map.get(val) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({ key: k, count: v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  function calcGrowth(curr: number, prev: number): { pct: number; isNew: boolean } {
    if (prev === 0 && curr > 0) return { pct: 100, isNew: true };
    if (prev === 0 && curr === 0) return { pct: 0, isNew: false };
    return { pct: Math.round(((curr - prev) / prev) * 100), isNew: false };
  }

  const comparisonRows = useMemo(() => {
    if (!current || !previous) return [];
    const labels: { key: keyof WeekCounts; label: string }[] = [
      { key: 'leads', label: 'Leads' },
      { key: 'oportunidades', label: 'Oportunidades' },
      { key: 'cargas', label: 'Cargas' },
      { key: 'embarcadores', label: 'Embarcadores' },
      { key: 'transportadores', label: 'Transportadores' },
      { key: 'conteudos', label: 'Conteúdos' },
    ];
    return labels.map(({ key, label }) => {
      const curr = current[key];
      const prev = previous[key];
      const growth = calcGrowth(curr, prev);
      return { label, curr, prev, growth };
    });
  }, [current, previous]);

  async function saveConclusao() {
    setSaving(true);
    const { data: existing } = await supabase
      .from('metrics')
      .select('id')
      .eq('data', today)
      .eq('metrica', 'relatorio_semanal_conclusao')
      .maybeSingle();
    if (existing) {
      await supabase.from('metrics').update({ observacoes: conclusao }).eq('id', (existing as { id: string }).id);
    } else {
      await supabase.from('metrics').insert({ data: today, metrica: 'relatorio_semanal_conclusao', valor: 0, observacoes: conclusao });
    }
    setSaving(false);
  }

  if (loading || !current || !previous) {
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
          <h2 className="text-lg font-semibold text-slate-800">Relatório Semanal</h2>
          <p className="text-sm text-slate-400">
            {formatDate(weekAgo.toISOString())} a {formatDate(now.toISOString())}
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <SectionCard title="Comparação: Semana Atual vs Anterior">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-3 py-2.5 font-medium text-slate-500">Métrica</th>
                <th className="px-3 py-2.5 font-medium text-slate-500 text-right">Semana Anterior</th>
                <th className="px-3 py-2.5 font-medium text-slate-500 text-right">Semana Atual</th>
                <th className="px-3 py-2.5 font-medium text-slate-500 text-right">Variação</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-medium text-slate-700">{row.label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{row.prev}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-800">{row.curr}</td>
                  <td className="px-3 py-2.5 text-right">
                    {row.growth.isNew ? (
                      <Badge className="text-emerald-700 bg-emerald-50 border-emerald-200">Novo</Badge>
                    ) : row.growth.pct > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        +{row.growth.pct}%
                      </span>
                    ) : row.growth.pct < 0 ? (
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {row.growth.pct}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Best of sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Melhores Cidades">
          {melhoresCidades.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <div className="space-y-2">
              {melhoresCidades.map((c, i) => (
                <div key={c.key} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                    <span className="text-sm text-slate-700">{c.key}</span>
                  </div>
                  <Badge className="text-blue-700 bg-blue-50 border-blue-200">{c.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Melhores Estados">
          {melhoresEstados.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <div className="space-y-2">
              {melhoresEstados.map((e, i) => (
                <div key={e.key} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                    <span className="text-sm text-slate-700">{e.key}</span>
                  </div>
                  <Badge className="text-blue-700 bg-blue-50 border-blue-200">{e.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Melhores Segmentos">
          {melhoresSegmentos.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <div className="space-y-2">
              {melhoresSegmentos.map((s, i) => (
                <div key={s.key} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                    <span className="text-sm text-slate-700">{s.key}</span>
                  </div>
                  <Badge className="text-blue-700 bg-blue-50 border-blue-200">{s.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Melhores Leads da Semana">
          {topLeads.length === 0 ? (
            <EmptyState title="Nenhum lead nesta semana" />
          ) : (
            <div className="space-y-2">
              {topLeads.map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{l.empresa || '-'}</p>
                    <p className="text-xs text-slate-400">{l.cidade}/{l.estado}</p>
                  </div>
                  <Badge className="text-amber-700 bg-amber-50 border-amber-200">{l.score}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Melhores Conteúdos da Semana">
          {topConteudos.length === 0 ? (
            <EmptyState title="Nenhum conteúdo nesta semana" />
          ) : (
            <div className="space-y-2">
              {topConteudos.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{c.titulo || '-'}</p>
                    <p className="text-xs text-slate-400">{c.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Conclusion */}
      <SectionCard
        title="Onde a Mussi deve concentrar esforços na próxima semana?"
        action={
          <Button onClick={saveConclusao} disabled={saving} size="sm">
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <textarea
            value={conclusao}
            onChange={(e) => setConclusao(e.target.value)}
            rows={4}
            placeholder="Descreva onde a Mussi deve concentrar esforços na próxima semana..."
            className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </SectionCard>
    </div>
  );
}
