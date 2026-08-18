import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Power } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { PalavraChave } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select, Button } from '@/components/ui/Form';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { formatDate } from '@/lib/constants';

const EMPTY: Partial<PalavraChave> = {
  termo: '', categoria: '', ativa: true,
};

export function PalavrasChavePage() {
  const { data, loading, create, update, remove } = useCrud<PalavraChave>('palavras_chave');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PalavraChave | null>(null);
  const [form, setForm] = useState<Partial<PalavraChave>>(EMPTY);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.termo, r.categoria]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    return rows;
  }, [data, search]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(p: PalavraChave) {
    setEditing(p);
    setForm(p);
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

  async function toggleAtiva(p: PalavraChave) {
    await update(p.id, { ativa: !p.ativa });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4" />
          Nova Palavra-chave
        </Button>
      </div>

      <SectionCard title="Filtros">
        <div className="relative max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar termo, categoria..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </SectionCard>

      <SectionCard title="Palavras-chave">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma palavra-chave cadastrada"
            description="Adicione termos para monitoramento e conteúdo."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Palavra-chave
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'termo', label: 'Termo' },
              { key: 'categoria', label: 'Categoria', render: (r) => r.categoria || '-' },
              {
                key: 'ativa',
                label: 'Status',
                render: (r) => (
                  <button onClick={(e) => { e.stopPropagation(); toggleAtiva(r); }} title="Alternar status">
                    <Badge className={r.ativa ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200'}>
                      {r.ativa ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </button>
                ),
              },
              { key: 'created_at', label: 'Criado', render: (r) => formatDate(r.created_at) },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleAtiva(r); }} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title={r.ativa ? 'Desativar' : 'Ativar'}>
                      <Power className="h-4 w-4" />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Palavra-chave' : 'Nova Palavra-chave'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Termo"><Input value={form.termo ?? ''} onChange={(e) => setForm({ ...form, termo: e.target.value })} required /></Field>
          <Field label="Categoria"><Input value={form.categoria ?? ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></Field>
          <Field label="Ativa">
            <Select
              options={['true', 'false']}
              value={String(form.ativa ?? true)}
              onChange={(e) => setForm({ ...form, ativa: e.target.value === 'true' })}
            />
          </Field>
          <div className="flex items-center justify-end gap-2 rounded-lg bg-slate-50 px-4 py-2.5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
