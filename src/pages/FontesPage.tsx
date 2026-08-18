import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Fonte } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { TIPOS_FONTE, CONFIABILIDADES, formatDate } from '@/lib/constants';

function confiabilidadeColor(c: string): string {
  switch (c) {
    case 'ALTA':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'MEDIA':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'BAIXA':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

const EMPTY: Partial<Fonte> = {
  nome: '', url: '', tipo: '', data: '', confiabilidade: 'MEDIA', observacoes: '',
};

export function FontesPage() {
  const { data, loading, create, update, remove } = useCrud<Fonte>('fontes');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fonte | null>(null);
  const [form, setForm] = useState<Partial<Fonte>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('recent');

  const tipoOptions: FilterOption[] = TIPOS_FONTE.map((t) => ({ label: t, value: t }));
  const confiabilidadeOptions: FilterOption[] = CONFIABILIDADES.map((c) => ({ label: c, value: c }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.nome, r.url, r.tipo]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.tipo) rows = rows.filter((r) => r.tipo === filters.tipo);
    if (filters.confiabilidade) rows = rows.filter((r) => r.confiabilidade === filters.confiabilidade);

    switch (sortBy) {
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'nome': rows = [...rows].sort((a, b) => a.nome.localeCompare(b.nome)); break;
      case 'tipo': rows = [...rows].sort((a, b) => a.tipo.localeCompare(b.tipo)); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(f: Fonte) {
    setEditing(f);
    setForm(f);
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
          Nova Fonte
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar nome, url, tipo..."
          filters={[
            { key: 'tipo', label: 'Tipo', value: filters.tipo ?? '', options: tipoOptions },
            { key: 'confiabilidade', label: 'Confiabilidade', value: filters.confiabilidade ?? '', options: confiabilidadeOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Nome', value: 'nome' },
            { label: 'Tipo', value: 'tipo' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Fontes">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma fonte cadastrada"
            description="Adicione fontes públicas para alimentar o radar."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Fonte
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'nome', label: 'Nome' },
              { key: 'tipo', label: 'Tipo' },
              {
                key: 'url',
                label: 'URL',
                render: (r) =>
                  r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {r.url}
                    </a>
                  ) : (
                    '-'
                  ),
              },
              { key: 'confiabilidade', label: 'Confiabilidade', render: (r) => <Badge className={confiabilidadeColor(r.confiabilidade)}>{r.confiabilidade}</Badge> },
              { key: 'data', label: 'Data', render: (r) => formatDate(r.data) },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Fonte' : 'Nova Fonte'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome"><Input value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></Field>
            <Field label="Tipo"><Select options={TIPOS_FONTE} value={form.tipo ?? ''} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></Field>
            <Field label="URL"><Input value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })} /></Field>
            <Field label="Data"><Input type="date" value={form.data ?? ''} onChange={(e) => setForm({ ...form, data: e.target.value })} /></Field>
            <Field label="Confiabilidade"><Select options={CONFIABILIDADES} value={form.confiabilidade ?? ''} onChange={(e) => setForm({ ...form, confiabilidade: e.target.value })} /></Field>
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
