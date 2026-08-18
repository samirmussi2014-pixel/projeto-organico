import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Memoria } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Button } from '@/components/ui/Form';
import { DataTable } from '@/components/ui/Table';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import { formatDate } from '@/lib/constants';

const EMPTY: Partial<Memoria> = {
  empresa: '', empresa_contatada: '', resposta: '', status: '',
  rota: '', segmento: '', resultado: '', conteudo_publicado: '',
  performance: '', motivo_perda: '', melhor_horario: '', melhor_abordagem: '',
  observacoes: '',
};

export function MemoriaPage() {
  const { data, loading, create, update, remove } = useCrud<Memoria>('memoria');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Memoria | null>(null);
  const [form, setForm] = useState<Partial<Memoria>>(EMPTY);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.empresa, r.empresa_contatada, r.rota, r.segmento, r.resultado]
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

  function openEdit(m: Memoria) {
    setEditing(m);
    setForm(m);
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
          Nova Memória
        </Button>
      </div>

      <SectionCard title="Memória">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresa, empresa contatada, rota, segmento, resultado..."
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma memória cadastrada"
            description="Registre o histórico de contatos e resultados."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Nova Memória
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'empresa', label: 'Empresa' },
              { key: 'empresa_contatada', label: 'Empresa Contatada' },
              { key: 'status', label: 'Status' },
              { key: 'rota', label: 'Rota' },
              { key: 'segmento', label: 'Segmento' },
              { key: 'resultado', label: 'Resultado' },
              { key: 'created_at', label: 'Criado em', render: (r) => formatDate(r.created_at) },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Memória' : 'Nova Memória'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Empresa"><Input value={form.empresa ?? ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} /></Field>
            <Field label="Empresa Contatada"><Input value={form.empresa_contatada ?? ''} onChange={(e) => setForm({ ...form, empresa_contatada: e.target.value })} /></Field>
            <Field label="Resposta"><Input value={form.resposta ?? ''} onChange={(e) => setForm({ ...form, resposta: e.target.value })} /></Field>
            <Field label="Status"><Input value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
            <Field label="Rota"><Input value={form.rota ?? ''} onChange={(e) => setForm({ ...form, rota: e.target.value })} /></Field>
            <Field label="Segmento"><Input value={form.segmento ?? ''} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
            <Field label="Resultado"><Input value={form.resultado ?? ''} onChange={(e) => setForm({ ...form, resultado: e.target.value })} /></Field>
            <Field label="Conteúdo Publicado"><Input value={form.conteudo_publicado ?? ''} onChange={(e) => setForm({ ...form, conteudo_publicado: e.target.value })} /></Field>
            <Field label="Performance"><Input value={form.performance ?? ''} onChange={(e) => setForm({ ...form, performance: e.target.value })} /></Field>
            <Field label="Motivo da Perda"><Input value={form.motivo_perda ?? ''} onChange={(e) => setForm({ ...form, motivo_perda: e.target.value })} /></Field>
            <Field label="Melhor Horário"><Input value={form.melhor_horario ?? ''} onChange={(e) => setForm({ ...form, melhor_horario: e.target.value })} /></Field>
            <Field label="Melhor Abordagem"><Input value={form.melhor_abordagem ?? ''} onChange={(e) => setForm({ ...form, melhor_abordagem: e.target.value })} /></Field>
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
