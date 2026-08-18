import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Conteudo } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { ESTADOS_BR, SEGMENTOS, TIPOS_CONTEUDO, formatDate } from '@/lib/constants';

const STATUS_CONTEUDO = ['RASCUNHO', 'REVISAO', 'PRONTO', 'PUBLICADO'];

function statusConteudoColor(status: string): string {
  switch (status) {
    case 'RASCUNHO':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    case 'REVISAO':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'PRONTO':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'PUBLICADO':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

const EMPTY: Partial<Conteudo> = {
  titulo: '', assunto: '', palavra_chave: '', cidade: '', estado: '',
  segmento: '', rota: '', tipo: '', status: 'RASCUNHO', data: new Date().toISOString().slice(0, 10),
  conteudo: '', cta: '',
};

export function ConteudoPage() {
  const { data, loading, create, update, remove } = useCrud<Conteudo>('conteudos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Conteudo | null>(null);
  const [form, setForm] = useState<Partial<Conteudo>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('recent');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));
  const tipoOptions: FilterOption[] = TIPOS_CONTEUDO.map((t) => ({ label: t, value: t }));
  const statusOptions: FilterOption[] = STATUS_CONTEUDO.map((s) => ({ label: s, value: s }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.titulo, r.assunto, r.palavra_chave]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado) rows = rows.filter((r) => r.estado === filters.estado);
    if (filters.tipo) rows = rows.filter((r) => r.tipo === filters.tipo);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);

    switch (sortBy) {
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'titulo': rows = [...rows].sort((a, b) => (a.titulo ?? '').localeCompare(b.titulo ?? '')); break;
      case 'tipo': rows = [...rows].sort((a, b) => (a.tipo ?? '').localeCompare(b.tipo ?? '')); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(c: Conteudo) {
    setEditing(c);
    setForm(c);
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
          Novo Conteúdo
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar título, assunto, palavra-chave..."
          filters={[
            { key: 'estado', label: 'Estado', value: filters.estado ?? '', options: estadoOptions },
            { key: 'tipo', label: 'Tipo', value: filters.tipo ?? '', options: tipoOptions },
            { key: 'status', label: 'Status', value: filters.status ?? '', options: statusOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Título', value: 'titulo' },
            { label: 'Tipo', value: 'tipo' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Conteúdos">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum conteúdo cadastrado"
            description="Crie artigos, posts e chamadas comerciais."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Novo Conteúdo
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'titulo', label: 'Título' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'cidade', label: 'Cidade/UF', render: (r) => `${r.cidade || '-'}/${r.estado || '-'}` },
              { key: 'segmento', label: 'Segmento' },
              { key: 'status', label: 'Status', render: (r) => <Badge className={statusConteudoColor(r.status)}>{r.status}</Badge> },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Conteúdo' : 'Novo Conteúdo'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Título"><Input value={form.titulo ?? ''} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></Field>
            <Field label="Assunto"><Input value={form.assunto ?? ''} onChange={(e) => setForm({ ...form, assunto: e.target.value })} /></Field>
            <Field label="Palavra-chave"><Input value={form.palavra_chave ?? ''} onChange={(e) => setForm({ ...form, palavra_chave: e.target.value })} /></Field>
            <Field label="Cidade"><Input value={form.cidade ?? ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field>
            <Field label="Estado"><Select options={ESTADOS_BR} value={form.estado ?? ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></Field>
            <Field label="Segmento"><Select options={SEGMENTOS} value={form.segmento ?? ''} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
            <Field label="Rota"><Input value={form.rota ?? ''} onChange={(e) => setForm({ ...form, rota: e.target.value })} /></Field>
            <Field label="Tipo"><Select options={TIPOS_CONTEUDO} value={form.tipo ?? ''} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></Field>
            <Field label="Status"><Select options={STATUS_CONTEUDO} value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
            <Field label="Data"><Input type="date" value={form.data ?? ''} onChange={(e) => setForm({ ...form, data: e.target.value })} /></Field>
            <Field label="CTA"><Input value={form.cta ?? ''} onChange={(e) => setForm({ ...form, cta: e.target.value })} /></Field>
          </div>
          <Field label="Conteúdo"><Textarea rows={8} value={form.conteudo ?? ''} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} /></Field>
          <div className="flex items-center justify-end gap-2 rounded-lg bg-slate-50 px-4 py-2.5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
