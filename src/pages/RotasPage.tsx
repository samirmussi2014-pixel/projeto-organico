import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Rota } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { ScoreBadge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { ESTADOS_BR, TIPOS_CARGA, formatDate } from '@/lib/constants';
import { autoScoreFromFields } from '@/lib/scoring';

const HIGH_VALUE_KEYS = ['nome', 'origem', 'destino', 'estado_origem', 'estado_destino', 'tipo_carga', 'frequencia', 'distancia_km'];

const EMPTY: Partial<Rota> = {
  nome: '', origem: '', destino: '', estado_origem: '', estado_destino: '',
  distancia_km: '', tempo_estimado: '', tipo_carga: '', frequencia: '',
  observacoes: '', score: 0,
};

export function RotasPage() {
  const { data, loading, create, update, remove } = useCrud<Rota>('rotas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Rota | null>(null);
  const [form, setForm] = useState<Partial<Rota>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('score_desc');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.nome, r.origem, r.destino]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado_origem) rows = rows.filter((r) => r.estado_origem === filters.estado_origem);
    if (filters.estado_destino) rows = rows.filter((r) => r.estado_destino === filters.estado_destino);

    switch (sortBy) {
      case 'score_desc': rows = [...rows].sort((a, b) => b.score - a.score); break;
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'estado': rows = [...rows].sort((a, b) => a.estado_origem.localeCompare(b.estado_origem)); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(r: Rota) {
    setEditing(r);
    setForm(r);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4" />
          Nova Rota
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar nome, origem, destino..."
          filters={[
            { key: 'estado_origem', label: 'Estado Origem', value: filters.estado_origem ?? '', options: estadoOptions },
            { key: 'estado_destino', label: 'Estado Destino', value: filters.estado_destino ?? '', options: estadoOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Maior Score', value: 'score_desc' },
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Estado', value: 'estado' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Rotas">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma rota cadastrada"
            description="Adicione rotas identificadas para fretes."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Rota
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'nome', label: 'Nome' },
              { key: 'rota', label: 'Rota', render: (r) => `${r.origem || '...'} → ${r.destino || '...'}` },
              { key: 'estados', label: 'Estados', render: (r) => `${r.estado_origem || '-'}/${r.estado_destino || '-'}` },
              { key: 'distancia_km', label: 'Distância (km)', render: (r) => r.distancia_km || '-' },
              { key: 'frequencia', label: 'Frequência', render: (r) => r.frequencia || '-' },
              { key: 'score', label: 'Score', render: (r) => <ScoreBadge score={r.score} /> },
              { key: 'created_at', label: 'Criado', render: (r) => formatDate(r.created_at) },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Rota' : 'Nova Rota'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nome"><Input value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></Field>
            <Field label="Origem"><Input value={form.origem ?? ''} onChange={(e) => setForm({ ...form, origem: e.target.value })} /></Field>
            <Field label="Destino"><Input value={form.destino ?? ''} onChange={(e) => setForm({ ...form, destino: e.target.value })} /></Field>
            <Field label="Estado Origem"><Select options={ESTADOS_BR} value={form.estado_origem ?? ''} onChange={(e) => setForm({ ...form, estado_origem: e.target.value })} /></Field>
            <Field label="Estado Destino"><Select options={ESTADOS_BR} value={form.estado_destino ?? ''} onChange={(e) => setForm({ ...form, estado_destino: e.target.value })} /></Field>
            <Field label="Distância (km)"><Input value={form.distancia_km ?? ''} onChange={(e) => setForm({ ...form, distancia_km: e.target.value })} /></Field>
            <Field label="Tempo Estimado"><Input value={form.tempo_estimado ?? ''} onChange={(e) => setForm({ ...form, tempo_estimado: e.target.value })} /></Field>
            <Field label="Tipo de Carga"><Select options={TIPOS_CARGA} value={form.tipo_carga ?? ''} onChange={(e) => setForm({ ...form, tipo_carga: e.target.value })} /></Field>
            <Field label="Frequência"><Input value={form.frequencia ?? ''} onChange={(e) => setForm({ ...form, frequencia: e.target.value })} /></Field>
          </div>
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
