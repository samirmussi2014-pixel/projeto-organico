import { useEffect, useState } from 'react';
import { Eye, UserCog, Bot, Save, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Field, Input, Select, Button } from '@/components/ui/Form';
import { SectionCard } from '@/components/ui/Cards';
import type { AppSettings, ModoOperacao } from '@/lib/types';

const MODOS: { value: ModoOperacao; label: string; description: string; icon: typeof Eye }[] = [
  {
    value: 'OBSERVACAO',
    label: 'Observação',
    description: 'Somente pesquisa e análise. Nenhuma ação externa é executada.',
    icon: Eye,
  },
  {
    value: 'ASSISTIDO',
    label: 'Assistido',
    description: 'Pesquisa, organiza, cria conteúdo e prepara leads. Ações externas exigem aprovação.',
    icon: UserCog,
  },
  {
    value: 'AUTONOMO',
    label: 'Autônomo',
    description: 'Executa atividades previamente autorizadas e de baixo risco. Atividades sensíveis retornam ao modo assistido.',
    icon: Bot,
  },
];

const REGRAS_SEGURANCA = [
  'Não envia mensagens em massa (spam, disparos automáticos).',
  'Não publica conteúdo automaticamente sem aprovação humana.',
  'Não cria contas falsas em plataformas de terceiros.',
  'Não acessa dados privados ou protegidos por autenticação.',
  'Não realiza ligações telefônicas automatizadas.',
  'Não altera informações de terceiros sem consentimento.',
  'Não coleta dados pessoais sensíveis (LGPD) sem base legal.',
  'Atividades sensíveis sempre retornam ao modo assistido.',
];

export function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    modo_operacao: 'OBSERVACAO',
    custo_operacional: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) setSettings(data as AppSettings);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    if (settings.id) {
      await supabase
        .from('app_settings')
        .update({
          modo_operacao: settings.modo_operacao,
          custo_operacional: settings.custo_operacional ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
    } else {
      const { data } = await supabase
        .from('app_settings')
        .insert({
          modo_operacao: settings.modo_operacao,
          custo_operacional: settings.custo_operacional ?? 0,
        })
        .select()
        .maybeSingle();
      if (data) setSettings(data as AppSettings);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Modo de Operação">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MODOS.map((m) => {
            const Icon = m.icon;
            const active = settings.modo_operacao === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, modo_operacao: m.value }))}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`mb-3 inline-flex rounded-lg p-2 ${active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className={`font-semibold ${active ? 'text-blue-700' : 'text-slate-700'}`}>{m.label}</p>
                <p className="mt-1 text-sm text-slate-500">{m.description}</p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Custo Operacional">
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-4xl font-bold tabular-nums text-slate-800">
            R$ {(settings.custo_operacional ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            O sistema mantém custo operacional zero por padrão.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Segurança">
        <ul className="space-y-2.5">
          {REGRAS_SEGURANCA.map((regra) => (
            <li key={regra} className="flex items-start gap-2.5">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-sm text-slate-600">{regra}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-700">
            Qualquer tentativa de violar estas regras retorna o sistema ao modo assistido automaticamente.
          </p>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
