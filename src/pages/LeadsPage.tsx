import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Lead } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { ScoreBadge, Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import {
  ESTADOS_BR, SEGMENTOS, TIPOS_CARGA, LEAD_STATUS,
  statusColor, formatDate,
} from '@/lib/constants';
import { autoScoreFromFields } from '@/lib/scoring';

const HIGH_VALUE_KEYS = ['empresa', 'pessoa', 'telefone', 'email', 'potencial', 'rota', 'tipo_carga', 'origem'];

const EMPTY: Partial<Lead> = {
  empresa: '', pessoa: '', telefone: '', email: '', cidade: '', estado: '',
  segmento: '', origem: '', rota: '', tipo_carga: '', potencial: '',
  score: 0, status: 'NOVO', observacoes: '', proxima_acao: '',
  data_proximo_contato: null,
};

export function LeadsPage() {
  const { data, loading, create, update, remove } = useCrud<Lead>('leads');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Partial<Lead>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('score_desc');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));
  const statusOptions: FilterOption[] = LEAD_STATUS.map((s) => ({ label: s, value: s }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.empresa, r.pessoa, r.cidade, r.segmento, r.origem, r.rota, r.tipo_carga]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado) rows = rows.filter((r) => r.estado === filters.estado);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);

    switch (sortBy) {
      case 'score_desc': rows = [...rows].sort((a, b) => b.score - a.score); break;
      case 'recent': rows = [...rows].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')); break;
      case 'estado': rows = [...rows].sort((a, b) => a.estado.localeCompare(b.estado)); break;
      case 'proximo_contato': rows = [...rows].sort((a, b) => (a.data_proximo_contato ?? '').localeCompare(b.data_proximo_contato ?? '')); break;
    }
    return rows;
  }, [data, search, filters, sortBy]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(l: Lead) {
    setEditing(l);
    setForm(l);
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
          Novo Lead
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar empresa, pessoa, cidade, segmento..."
          filters={[
            { key: 'estado', label: 'Estado', value: filters.estado ?? '', options: estadoOptions },
            { key: 'status', label: 'Status', value: filters.status ?? '', options: statusOptions },
          ]}
          onFilter={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { label: 'Maior Score', value: 'score_desc' },
            { label: 'Mais Recente', value: 'recent' },
            { label: 'Estado', value: 'estado' },
            { label: 'Próximo Contato', value: 'proximo_contato' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Leads">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum lead cadastrado"
            description="Adicione leads identificados para acompanhamento comercial."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Novo Lead
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'empresa', label: 'Empresa' },
              { key: 'pessoa', label: 'Pessoa' },
              { key: 'cidade', label: 'Cidade/UF', render: (r) => `${r.cidade || '-'}/${r.estado || '-'}` },
              { key: 'segmento', label: 'Segmento' },
              { key: 'potencial', label: 'Potencial' },
              { key: 'status', label: 'Status', render: (r) => <Badge className={statusColor(r.status)}>{r.status}</Badge> },
              { key: 'score', label: 'Score', render: (r) => <ScoreBadge score={r.score} /> },
              { key: 'data_proximo_contato', label: 'Próximo Contato', render: (r) => formatDate(r.data_proximo_contato) },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Lead' : 'Novo Lead'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Empresa"><Input value={form.empresa ?? ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} required /></Field>
            <Field label="Pessoa"><Input value={form.pessoa ?? ''} onChange={(e) => setForm({ ...form, pessoa: e.target.value })} /></Field>
            <Field label="Telefone"><Input value={form.telefone ?? ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></Field>
            <Field label="E-mail"><Input value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Cidade"><Input value={form.cidade ?? ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field>
            <Field label="Estado"><Select options={ESTADOS_BR} value={form.estado ?? ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></Field>
            <Field label="Segmento"><Select options={SEGMENTOS} value={form.segmento ?? ''} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
            <Field label="Origem"><Input value={form.origem ?? ''} onChange={(e) => setForm({ ...form, origem: e.target.value })} /></Field>
            <Field label="Rota"><Input value={form.rota ?? ''} onChange={(e) => setForm({ ...form, rota: e.target.value })} /></Field>
            <Field label="Tipo de Carga"><Select options={TIPOS_CARGA} value={form.tipo_carga ?? ''} onChange={(e) => setForm({ ...form, tipo_carga: e.target.value })} /></Field>
            <Field label="Potencial"><Input value={form.potencial ?? ''} onChange={(e) => setForm({ ...form, potencial: e.target.value })} /></Field>
            <Field label="Status"><Select options={LEAD_STATUS} value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
            <Field label="Próxima Ação"><Input value={form.proxima_acao ?? ''} onChange={(e) => setForm({ ...form, proxima_acao: e.target.value })} /></Field>
            <Field label="Data do Próximo Contato"><Input type="date" value={form.data_proximo_contato ?? ''} onChange={(e) => setForm({ ...form, data_proximo_contato: e.target.value || null })} /></Field>
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
