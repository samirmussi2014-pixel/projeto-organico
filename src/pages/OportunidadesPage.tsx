import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Target } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Oportunidade } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { ScoreBadge, Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import {
  ESTADOS_BR, SEGMENTOS, TIPOS_CARGA, statusColor, formatDate,
} from '@/lib/constants';
import { autoScoreFromFields } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';

const HIGH_VALUE_KEYS = ['empresa', 'tipo', 'evidencia', 'fonte', 'acao_recomendada', 'rota', 'potencial', 'segmento'];

const TIPOS_OPORTUNIDADE = ['CARGA', 'EMBARCADOR', 'TRANSPORTADOR'];

const EMPTY: Partial<Oportunidade> = {
  empresa: '', tipo: '', cidade: '', estado: '', segmento: '', rota: '',
  tipo_carga: '', potencial: '', score: 0, evidencia: '', fonte: '',
  acao_recomendada: '', status: 'NOVO', origem_tipo: '', origem_id: '',
};

export function OportunidadesPage() {
  const { data, loading, create, update, remove } = useCrud<Oportunidade>('oportunidades');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Oportunidade | null>(null);
  const [form, setForm] = useState<Partial<Oportunidade>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('score_desc');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));
  const tipoOptions: FilterOption[] = TIPOS_OPORTUNIDADE.map((t) => ({ label: t, value: t }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.empresa, r.cidade, r.segmento, r.tipo_carga, r.fonte, r.rota]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado) rows = rows.filter((r) => r.estado === filters.estado);
    if (filters.tipo) rows = rows.filter((r) => r.tipo === filters.tipo);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);

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

  function openEdit(o: Oportunidade) {
    setEditing(o);
    setForm(o);
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

  async function convertToLead(o: Oportunidade) {
    await supabase.from('leads').insert({
      empresa: o.empresa,
      origem: o.tipo,
      cidade: o.cidade,
      estado: o.estado,
      segmento: o.segmento,
      rota: o.rota,
      tipo_carga: o.tipo_carga,
      potencial: o.potencial,
      score: o.score,
      status: 'NOVO',
      observacoes: o.evidencia,
      proxima_acao: o.acao_recomendada,
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
          Nova Oportunidade
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar empresa, cidade, segmento..."
          filters={[
            { key: 'estado', label: 'Estado', value: filters.estado ?? '', options: estadoOptions },
            { key: 'tipo', label: 'Tipo', value: filters.tipo ?? '', options: tipoOptions },
            { key: 'status', label: 'Status', value: filters.status ?? '', options: [] },
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

      <SectionCard title="Oportunidades">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma oportunidade cadastrada"
            description="Adicione oportunidades identificadas para conversão em leads."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Oportunidade
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'empresa', label: 'Empresa' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'cidade', label: 'Cidade/UF', render: (r) => `${r.cidade || '-'}/${r.estado || '-'}` },
              { key: 'segmento', label: 'Segmento' },
              { key: 'rota', label: 'Rota', render: (r) => r.rota || '-' },
              { key: 'tipo_carga', label: 'Tipo de Carga' },
              { key: 'potencial', label: 'Potencial' },
              { key: 'score', label: 'Score', render: (r) => <ScoreBadge score={r.score} /> },
              { key: 'status', label: 'Status', render: (r) => <Badge className={statusColor(r.status)}>{r.status}</Badge> },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={(e) => { e.stopPropagation(); convertToLead(r); }} className="rounded p-1 text-emerald-500 hover:bg-emerald-50" title="Converter em Lead">
                      <Target className="h-4 w-4" />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Oportunidade' : 'Nova Oportunidade'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Empresa"><Input value={form.empresa ?? ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} required /></Field>
            <Field label="Tipo"><Select options={TIPOS_OPORTUNIDADE} value={form.tipo ?? ''} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></Field>
            <Field label="Cidade"><Input value={form.cidade ?? ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field>
            <Field label="Estado"><Select options={ESTADOS_BR} value={form.estado ?? ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></Field>
            <Field label="Segmento"><Select options={SEGMENTOS} value={form.segmento ?? ''} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
            <Field label="Rota"><Input value={form.rota ?? ''} onChange={(e) => setForm({ ...form, rota: e.target.value })} /></Field>
            <Field label="Tipo de Carga"><Select options={TIPOS_CARGA} value={form.tipo_carga ?? ''} onChange={(e) => setForm({ ...form, tipo_carga: e.target.value })} /></Field>
            <Field label="Potencial"><Input value={form.potencial ?? ''} onChange={(e) => setForm({ ...form, potencial: e.target.value })} /></Field>
            <Field label="Fonte"><Input value={form.fonte ?? ''} onChange={(e) => setForm({ ...form, fonte: e.target.value })} /></Field>
            <Field label="Status"><Input value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
            <Field label="Origem Tipo"><Input value={form.origem_tipo ?? ''} onChange={(e) => setForm({ ...form, origem_tipo: e.target.value })} /></Field>
            <Field label="Origem ID"><Input value={form.origem_id ?? ''} onChange={(e) => setForm({ ...form, origem_id: e.target.value })} /></Field>
          </div>
          <Field label="Evidência"><Textarea value={form.evidencia ?? ''} onChange={(e) => setForm({ ...form, evidencia: e.target.value })} /></Field>
          <Field label="Ação Recomendada"><Textarea value={form.acao_recomendada ?? ''} onChange={(e) => setForm({ ...form, acao_recomendada: e.target.value })} /></Field>
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
