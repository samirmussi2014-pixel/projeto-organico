import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Tarefa } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { TAREFA_STATUS, prioridadeColor, statusColor, formatDate } from '@/lib/constants';

const PRIORIDADES = ['ALTA', 'MEDIA', 'BAIXA'];

const EMPTY: Partial<Tarefa> = {
  titulo: '', descricao: '', responsavel: '', prioridade: 'MEDIA',
  status: 'PENDENTE', prazo: null, modulo_relacionado: '',
};

export function TarefasPage() {
  const { data, loading, create, update, remove } = useCrud<Tarefa>('tarefas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tarefa | null>(null);
  const [form, setForm] = useState<Partial<Tarefa>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('recent');

  const statusOptions: FilterOption[] = TAREFA_STATUS.map((s) => ({ label: s, value: s }));
  const prioridadeOptions: FilterOption[] = PRIORIDADES.map((p) => ({ label: p, value: p }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.titulo, r.descricao, r.responsavel]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    if (filters.prioridade) rows = rows.filter((r) => r.prioridade === filters.prioridade);

    switch (sortBy) {
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'prioridade': {
        const order: Record<string, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
        rows = [...rows].sort((a, b) => (order[a.prioridade] ?? 3) - (order[b.prioridade] ?? 3));
        break;
      }
      case 'prazo': rows = [...rows].sort((a, b) => (a.prazo ?? '').localeCompare(b.prazo ?? '')); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(t: Tarefa) {
    setEditing(t);
    setForm(t);
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
          Nova Tarefa
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar título, descrição, responsável..."
          filters={[
            { key: 'status', label: 'Status', value: filters.status ?? '', options: statusOptions },
            { key: 'prioridade', label: 'Prioridade', value: filters.prioridade ?? '', options: prioridadeOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Prioridade', value: 'prioridade' },
            { label: 'Prazo', value: 'prazo' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Tarefas">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma tarefa cadastrada"
            description="Organize atividades e acompanhe prazos."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'titulo', label: 'Título' },
              { key: 'responsavel', label: 'Responsável' },
              { key: 'prioridade', label: 'Prioridade', render: (r) => <Badge className={prioridadeColor(r.prioridade)}>{r.prioridade}</Badge> },
              { key: 'status', label: 'Status', render: (r) => <Badge className={statusColor(r.status)}>{r.status}</Badge> },
              { key: 'prazo', label: 'Prazo', render: (r) => formatDate(r.prazo) },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Tarefa' : 'Nova Tarefa'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Título"><Input value={form.titulo ?? ''} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></Field>
            <Field label="Responsável"><Input value={form.responsavel ?? ''} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></Field>
            <Field label="Prioridade"><Select options={PRIORIDADES} value={form.prioridade ?? ''} onChange={(e) => setForm({ ...form, prioridade: e.target.value })} /></Field>
            <Field label="Status"><Select options={TAREFA_STATUS} value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
            <Field label="Prazo"><Input type="date" value={form.prazo ?? ''} onChange={(e) => setForm({ ...form, prazo: e.target.value })} /></Field>
            <Field label="Módulo Relacionado"><Input value={form.modulo_relacionado ?? ''} onChange={(e) => setForm({ ...form, modulo_relacionado: e.target.value })} /></Field>
          </div>
          <Field label="Descrição"><Textarea value={form.descricao ?? ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></Field>
          <div className="flex items-center justify-end gap-2 rounded-lg bg-slate-50 px-4 py-2.5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
