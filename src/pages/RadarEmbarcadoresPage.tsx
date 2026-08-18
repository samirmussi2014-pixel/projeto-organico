import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Star } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Embarcador } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { ScoreBadge, Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import {
  ESTADOS_BR, SEGMENTOS, TIPOS_CARGA,
  CLASSIFICACOES, classificacaoColor, statusColor, formatDate,
} from '@/lib/constants';
import { autoScoreFromFields } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';

const HIGH_VALUE_KEYS = ['empresa', 'contato_comercial_publico', 'site', 'evidencia', 'fonte', 'volume_estimado', 'frequencia_provavel'];

const EMPTY: Partial<Embarcador> = {
  empresa: '', cidade: '', estado: '', segmento: '', tipo_carga: '',
  origem_provavel: '', destino_provavel: '', frequencia_provavel: '', volume_estimado: '',
  contato_comercial_publico: '', site: '', rede_social_publica: '', fonte: '',
  evidencia: '', observacoes: '',
  score: 0, classificacao: 'NAO CONFIRMADA', status: 'NOVO',
};

export function RadarEmbarcadoresPage() {
  const { data, loading, create, update, remove } = useCrud<Embarcador>('embarcadores');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Embarcador | null>(null);
  const [form, setForm] = useState<Partial<Embarcador>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('score_desc');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));
  const classifOptions: FilterOption[] = CLASSIFICACOES.map((c) => ({ label: c, value: c }));
  const segmentoOptions: FilterOption[] = SEGMENTOS.map((s) => ({ label: s, value: s }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.empresa, r.cidade, r.segmento, r.tipo_carga, r.origem_provavel, r.destino_provavel, r.fonte]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado) rows = rows.filter((r) => r.estado === filters.estado);
    if (filters.classificacao) rows = rows.filter((r) => r.classificacao === filters.classificacao);
    if (filters.segmento) rows = rows.filter((r) => r.segmento === filters.segmento);

    switch (sortBy) {
      case 'score_desc': rows = [...rows].sort((a, b) => b.score - a.score); break;
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'estado': rows = [...rows].sort((a, b) => a.estado.localeCompare(b.estado)); break;
      case 'cidade': rows = [...rows].sort((a, b) => a.cidade.localeCompare(b.cidade)); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(e: Embarcador) {
    setEditing(e);
    setForm(e);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const score = autoScoreFromFields(form as Record<string, unknown>, HIGH_VALUE_KEYS);
    const payload = { ...form, score };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
    setModalOpen(false);
  }

  async function convertToOportunidade(e: Embarcador) {
    await supabase.from('oportunidades').insert({
      empresa: e.empresa,
      tipo: 'EMBARCADOR',
      cidade: e.cidade,
      estado: e.estado,
      segmento: e.segmento,
      rota: `${e.origem_provavel || ''} → ${e.destino_provavel || ''}`,
      tipo_carga: e.tipo_carga,
      score: e.score,
      evidencia: e.evidencia,
      fonte: e.fonte,
      acao_recomendada: 'Verificar volume e frequência de embarque',
      status: 'NOVO',
      origem_tipo: 'embarcadores',
      origem_id: e.id,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4" />
          Nova Embarcador
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar empresa, cidade, segmento..."
          filters={[
            { key: 'estado', label: 'Estado', value: filters.estado ?? '', options: estadoOptions },
            { key: 'classificacao', label: 'Classificação', value: filters.classificacao ?? '', options: classifOptions },
            { key: 'segmento', label: 'Segmento', value: filters.segmento ?? '', options: segmentoOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Maior Score', value: 'score_desc' },
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Estado', value: 'estado' },
            { label: 'Cidade', value: 'cidade' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Embarcadores Identificados">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum embarcador cadastrado"
            description="Adicione embarcadores identificados em fontes públicas."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Embarcador
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'empresa', label: 'Empresa' },
              { key: 'cidade', label: 'Cidade/UF', render: (r) => `${r.cidade || '-'}/${r.estado || '-'}` },
              { key: 'segmento', label: 'Segmento' },
              { key: 'tipo_carga', label: 'Tipo de Carga' },
              { key: 'rota', label: 'Rota', render: (r) => `${r.origem_provavel || '...'} → ${r.destino_provavel || '...'}` },
              { key: 'classificacao', label: 'Classif.', render: (r) => <Badge className={classificacaoColor(r.classificacao)}>{r.classificacao}</Badge> },
              { key: 'score', label: 'Score', render: (r) => <ScoreBadge score={r.score} /> },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={(e) => { e.stopPropagation(); convertToOportunidade(r); }} className="rounded p-1 text-amber-500 hover:bg-amber-50" title="Converter em Oportunidade">
                      <Star className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} className="rounded p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            rows={filtered}
            rowKey={(r) => r.id}
            onRowClick={openEdit}
          />
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Embarcador' : 'Nova Embarcador'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Empresa"><Input value={form.empresa ?? ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} required /></Field>
            <Field label="Cidade"><Input value={form.cidade ?? ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field>
            <Field label="Estado"><Select options={ESTADOS_BR} value={form.estado ?? ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></Field>
            <Field label="Segmento"><Select options={SEGMENTOS} value={form.segmento ?? ''} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
            <Field label="Tipo de Carga"><Select options={TIPOS_CARGA} value={form.tipo_carga ?? ''} onChange={(e) => setForm({ ...form, tipo_carga: e.target.value })} /></Field>
            <Field label="Classificação"><Select options={CLASSIFICACOES} value={form.classificacao ?? ''} onChange={(e) => setForm({ ...form, classificacao: e.target.value })} /></Field>
            <Field label="Origem Provável"><Input value={form.origem_provavel ?? ''} onChange={(e) => setForm({ ...form, origem_provavel: e.target.value })} /></Field>
            <Field label="Destino Provável"><Input value={form.destino_provavel ?? ''} onChange={(e) => setForm({ ...form, destino_provavel: e.target.value })} /></Field>
            <Field label="Frequência Provável"><Input value={form.frequencia_provavel ?? ''} onChange={(e) => setForm({ ...form, frequencia_provavel: e.target.value })} /></Field>
            <Field label="Volume Estimado"><Input value={form.volume_estimado ?? ''} onChange={(e) => setForm({ ...form, volume_estimado: e.target.value })} /></Field>
            <Field label="Contato Comercial Público"><Input value={form.contato_comercial_publico ?? ''} onChange={(e) => setForm({ ...form, contato_comercial_publico: e.target.value })} /></Field>
            <Field label="Site"><Input value={form.site ?? ''} onChange={(e) => setForm({ ...form, site: e.target.value })} /></Field>
            <Field label="Rede Social Pública"><Input value={form.rede_social_publica ?? ''} onChange={(e) => setForm({ ...form, rede_social_publica: e.target.value })} /></Field>
            <Field label="Fonte"><Input value={form.fonte ?? ''} onChange={(e) => setForm({ ...form, fonte: e.target.value })} /></Field>
          </div>
          <Field label="Evidência"><Textarea value={form.evidencia ?? ''} onChange={(e) => setForm({ ...form, evidencia: e.target.value })} /></Field>
          <Field label="Observações"><Textarea value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></Field>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
            <span className="text-sm text-slate-500">
              Score automático: <span className="font-bold text-slate-700">{autoScoreFromFields(form as Record<string, unknown>, HIGH_VALUE_KEYS)}</span>
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
