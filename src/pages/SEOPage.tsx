import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { SeoKeyword } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { ESTADOS_BR, SEGMENTOS, formatDate } from '@/lib/constants';

const STATUS_OPTIONS = ['ATIVA', 'PAUSA', 'CONCLUIDA'];

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'ATIVA':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'PAUSA':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'CONCLUIDA':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

const EMPTY: Partial<SeoKeyword> = {
  termo: '', cidade: '', estado: '', segmento: '', volume_estimado: '',
  dificuldade: '', status: 'ATIVA', observacoes: '',
};

export function SEOPage() {
  const { data, loading, create, update, remove } = useCrud<SeoKeyword>('seo_keywords');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeoKeyword | null>(null);
  const [form, setForm] = useState<Partial<SeoKeyword>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('recent');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));
  const statusOptions: FilterOption[] = STATUS_OPTIONS.map((s) => ({ label: s, value: s }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.termo, r.cidade, r.segmento]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado) rows = rows.filter((r) => r.estado === filters.estado);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);

    switch (sortBy) {
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'termo': rows = [...rows].sort((a, b) => a.termo.localeCompare(b.termo)); break;
      case 'estado': rows = [...rows].sort((a, b) => a.estado.localeCompare(b.estado)); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(k: SeoKeyword) {
    setEditing(k);
    setForm(k);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await update(editing.id, form);
    } else {
      await create(form);
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
          Nova Keyword
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar termo, cidade, segmento..."
          filters={[
            { key: 'estado', label: 'Estado', value: filters.estado ?? '', options: estadoOptions },
            { key: 'status', label: 'Status', value: filters.status ?? '', options: statusOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Termo', value: 'termo' },
            { label: 'Estado', value: 'estado' },
          ]}
        />
      </SectionCard>

      <SectionCard title="SEO Keywords">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma keyword cadastrada"
            description="Adicione palavras-chave de SEO para acompanhamento."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Keyword
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'termo', label: 'Termo' },
              { key: 'cidade', label: 'Cidade/UF', render: (r) => `${r.cidade || '-'}/${r.estado || '-'}` },
              { key: 'segmento', label: 'Segmento', render: (r) => r.segmento || '-' },
              { key: 'volume_estimado', label: 'Volume', render: (r) => r.volume_estimado || '-' },
              { key: 'dificuldade', label: 'Dificuldade', render: (r) => r.dificuldade || '-' },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(r.status)}`}>
                    {r.status}
                  </span>
                ),
              },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Keyword' : 'Nova Keyword'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Termo"><Input value={form.termo ?? ''} onChange={(e) => setForm({ ...form, termo: e.target.value })} required /></Field>
            <Field label="Cidade"><Input value={form.cidade ?? ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field>
            <Field label="Estado"><Select options={ESTADOS_BR} value={form.estado ?? ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></Field>
            <Field label="Segmento"><Select options={SEGMENTOS} value={form.segmento ?? ''} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
            <Field label="Volume Estimado"><Input value={form.volume_estimado ?? ''} onChange={(e) => setForm({ ...form, volume_estimado: e.target.value })} /></Field>
            <Field label="Dificuldade"><Input value={form.dificuldade ?? ''} onChange={(e) => setForm({ ...form, dificuldade: e.target.value })} /></Field>
            <Field label="Status"><Select options={STATUS_OPTIONS} value={form.status ?? 'ATIVA'} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
          </div>
          <Field label="Observações"><Textarea value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></Field>
          <div className="flex items-center justify-end gap-2 rounded-lg bg-slate-50 px-4 py-2.5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
