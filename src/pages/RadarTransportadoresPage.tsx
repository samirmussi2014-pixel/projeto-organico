import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Star } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import type { Transportador } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select, Button } from '@/components/ui/Form';
import { FilterBar, DataTable, type FilterOption } from '@/components/ui/Table';
import { ScoreBadge, Badge } from '@/components/ui/Badge';
import { SectionCard, EmptyState } from '@/components/ui/Cards';
import {
  ESTADOS_BR, TIPOS_VEICULO, CLASSIFICACOES,
  classificacaoColor, statusColor, formatDate,
} from '@/lib/constants';
import { autoScoreFromFields } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';

const HIGH_VALUE_KEYS = [
  'transportadora', 'transportador_autonomo', 'motorista', 'contato_publico',
  'rotas', 'areas_atendidas', 'perfil_profissional', 'fonte',
];

const EMPTY: Partial<Transportador> = {
  transportadora: '', transportador_autonomo: '', motorista: '', agregado: '',
  frotista: '', cidade: '', estado: '', tipo_veiculo: '', capacidade: '',
  rotas: '', areas_atendidas: '', contato_publico: '', perfil_profissional: '',
  fonte: '', observacoes: '',
  score: 0, classificacao: 'NAO CONFIRMADA', status: 'NOVO',
};

function nomeTransportador(t: Transportador): string {
  return t.transportadora || t.transportador_autonomo || t.motorista || '-';
}

export function RadarTransportadoresPage() {
  const { data, loading, create, update, remove } = useCrud<Transportador>('transportadores');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transportador | null>(null);
  const [form, setForm] = useState<Partial<Transportador>>(EMPTY);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('score_desc');

  const estadoOptions: FilterOption[] = ESTADOS_BR.map((e) => ({ label: e, value: e }));
  const classifOptions: FilterOption[] = CLASSIFICACOES.map((c) => ({ label: c, value: c }));
  const tipoVeiculoOptions: FilterOption[] = TIPOS_VEICULO.map((v) => ({ label: v, value: v }));

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.transportadora, r.transportador_autonomo, r.motorista, r.cidade, r.rotas, r.areas_atendidas, r.fonte]
          .some((v) => v?.toLowerCase().includes(s))
      );
    }
    if (filters.estado) rows = rows.filter((r) => r.estado === filters.estado);
    if (filters.classificacao) rows = rows.filter((r) => r.classificacao === filters.classificacao);
    if (filters.tipo_veiculo) rows = rows.filter((r) => r.tipo_veiculo === filters.tipo_veiculo);

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

  function openEdit(t: Transportador) {
    setEditing(t);
    setForm(t);
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

  async function convertToOportunidade(t: Transportador) {
    await supabase.from('oportunidades').insert({
      empresa: t.transportadora || t.transportador_autonomo || t.motorista || '',
      tipo: 'TRANSPORTADOR',
      cidade: t.cidade,
      estado: t.estado,
      rota: t.rotas,
      score: t.score,
      evidencia: t.perfil_profissional,
      fonte: t.fonte,
      acao_recomendada: 'Verificar disponibilidade e áreas atendidas',
      status: 'NOVO',
      origem_tipo: 'transportadores',
      origem_id: t.id,
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
          Novo Transportador
        </Button>
      </div>

      <SectionCard title="Filtros">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar transportadora, motorista, cidade, rotas..."
          filters={[
            { key: 'estado', label: 'Estado', value: filters.estado ?? '', options: estadoOptions },
            { key: 'classificacao', label: 'Classificação', value: filters.classificacao ?? '', options: classifOptions },
            { key: 'tipo_veiculo', label: 'Tipo de Veículo', value: filters.tipo_veiculo ?? '', options: tipoVeiculoOptions },
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

      <SectionCard title="Transportadores Identificados">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum transportador cadastrado"
            description="Adicione transportadores identificados em fontes públicas."
            action={
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Novo Transportador
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'nome', label: 'Nome', render: (r) => nomeTransportador(r) },
              { key: 'cidade', label: 'Cidade/UF', render: (r) => `${r.cidade || '-'}/${r.estado || '-'}` },
              { key: 'tipo_veiculo', label: 'Tipo de Veículo' },
              { key: 'capacidade', label: 'Capacidade' },
              {
                key: 'areas_atendidas',
                label: 'Áreas Atendidas',
                render: (r) => (
                  <span className="block max-w-xs truncate" title={r.areas_atendidas}>
                    {r.areas_atendidas || '-'}
                  </span>
                ),
              },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Transportador' : 'Novo Transportador'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Transportadora"><Input value={form.transportadora ?? ''} onChange={(e) => setForm({ ...form, transportadora: e.target.value })} /></Field>
            <Field label="Transportador Autônomo"><Input value={form.transportador_autonomo ?? ''} onChange={(e) => setForm({ ...form, transportador_autonomo: e.target.value })} /></Field>
            <Field label="Motorista"><Input value={form.motorista ?? ''} onChange={(e) => setForm({ ...form, motorista: e.target.value })} /></Field>
            <Field label="Agregado"><Input value={form.agregado ?? ''} onChange={(e) => setForm({ ...form, agregado: e.target.value })} /></Field>
            <Field label="Frotista"><Input value={form.frotista ?? ''} onChange={(e) => setForm({ ...form, frotista: e.target.value })} /></Field>
            <Field label="Cidade"><Input value={form.cidade ?? ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field>
            <Field label="Estado"><Select options={ESTADOS_BR} value={form.estado ?? ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></Field>
            <Field label="Tipo de Veículo"><Select options={TIPOS_VEICULO} value={form.tipo_veiculo ?? ''} onChange={(e) => setForm({ ...form, tipo_veiculo: e.target.value })} /></Field>
            <Field label="Capacidade"><Input value={form.capacidade ?? ''} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} /></Field>
            <Field label="Rotas"><Input value={form.rotas ?? ''} onChange={(e) => setForm({ ...form, rotas: e.target.value })} /></Field>
            <Field label="Áreas Atendidas"><Input value={form.areas_atendidas ?? ''} onChange={(e) => setForm({ ...form, areas_atendidas: e.target.value })} /></Field>
            <Field label="Contato Público"><Input value={form.contato_publico ?? ''} onChange={(e) => setForm({ ...form, contato_publico: e.target.value })} /></Field>
            <Field label="Fonte"><Input value={form.fonte ?? ''} onChange={(e) => setForm({ ...form, fonte: e.target.value })} /></Field>
            <Field label="Classificação"><Select options={CLASSIFICACOES} value={form.classificacao ?? ''} onChange={(e) => setForm({ ...form, classificacao: e.target.value })} /></Field>
            <Field label="Status"><Select options={['NOVO']} value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
          </div>
          <Field label="Perfil Profissional"><Textarea value={form.perfil_profissional ?? ''} onChange={(e) => setForm({ ...form, perfil_profissional: e.target.value })} /></Field>
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
