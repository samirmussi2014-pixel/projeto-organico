import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Radar, Truck, Users, Target, Building2,
  Link2, Route, Tag, FileText, Search, CheckSquare, FileBarChart,
  CalendarDays, Brain, Settings, Menu, X, Eye, UserCog, Bot,
  Truck as TruckIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AppSettings, ModoOperacao } from '@/lib/types';

export type PageId =
  | 'dashboard' | 'radar-cargas' | 'radar-embarcadores' | 'radar-transportadores'
  | 'leads' | 'oportunidades' | 'empresas' | 'fontes' | 'rotas'
  | 'palavras-chave' | 'conteudo' | 'seo' | 'tarefas'
  | 'relatorio-diario' | 'relatorio-semanal' | 'memoria' | 'configuracoes';

interface NavItem {
  id: PageId;
  label: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
  { id: 'radar-cargas', label: 'Radar de Cargas', icon: <Radar className="h-4.5 w-4.5" /> },
  { id: 'radar-embarcadores', label: 'Radar de Embarcadores', icon: <Building2 className="h-4.5 w-4.5" /> },
  { id: 'radar-transportadores', label: 'Radar de Transportadores', icon: <Truck className="h-4.5 w-4.5" /> },
  { id: 'leads', label: 'Leads', icon: <Target className="h-4.5 w-4.5" /> },
  { id: 'oportunidades', label: 'Oportunidades', icon: <Users className="h-4.5 w-4.5" /> },
  { id: 'empresas', label: 'Empresas', icon: <Building2 className="h-4.5 w-4.5" /> },
  { id: 'fontes', label: 'Fontes', icon: <Link2 className="h-4.5 w-4.5" /> },
  { id: 'rotas', label: 'Rotas', icon: <Route className="h-4.5 w-4.5" /> },
  { id: 'palavras-chave', label: 'Palavras-chave', icon: <Tag className="h-4.5 w-4.5" /> },
  { id: 'conteudo', label: 'Conteúdo', icon: <FileText className="h-4.5 w-4.5" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="h-4.5 w-4.5" /> },
  { id: 'tarefas', label: 'Tarefas', icon: <CheckSquare className="h-4.5 w-4.5" /> },
  { id: 'relatorio-diario', label: 'Relatório Diário', icon: <FileBarChart className="h-4.5 w-4.5" /> },
  { id: 'relatorio-semanal', label: 'Relatório Semanal', icon: <CalendarDays className="h-4.5 w-4.5" /> },
  { id: 'memoria', label: 'Memória', icon: <Brain className="h-4.5 w-4.5" /> },
  { id: 'configuracoes', label: 'Configurações', icon: <Settings className="h-4.5 w-4.5" /> },
];

const MODOS: { value: ModoOperacao; label: string; icon: ReactNode; color: string }[] = [
  { value: 'OBSERVACAO', label: 'Observação', icon: <Eye className="h-3.5 w-3.5" />, color: 'text-slate-600 bg-slate-100 border-slate-300' },
  { value: 'ASSISTIDO', label: 'Assistido', icon: <UserCog className="h-3.5 w-3.5" />, color: 'text-blue-600 bg-blue-50 border-blue-300' },
  { value: 'AUTONOMO', label: 'Autônomo', icon: <Bot className="h-3.5 w-3.5" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
];

interface LayoutProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
}

export function Layout({ current, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as AppSettings);
      });
  }, []);

  async function changeModo(modo: ModoOperacao) {
    const { data } = await supabase
      .from('app_settings')
      .update({ modo_operacao: modo, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .maybeSingle();
    if (data) setSettings(data as AppSettings);
  }

  const modoInfo = MODOS.find((m) => m.value === settings?.modo_operacao) ?? MODOS[0];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
              <TruckIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">Mussi Fretes</p>
              <p className="text-xs text-slate-400 leading-tight">Growth OS</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-0.5">
              {NAV.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      current === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className={current === item.id ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Operation mode */}
          <div className="border-t border-slate-200 p-3">
            <p className="mb-2 px-1 text-xs font-medium text-slate-400">MODO DE OPERAÇÃO</p>
            <div className="space-y-1">
              {MODOS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => changeModo(m.value)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    settings?.modo_operacao === m.value
                      ? m.color
                      : 'border-transparent text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-base font-semibold text-slate-800 lg:text-lg">
              {NAV.find((n) => n.id === current)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${modoInfo.color}`}
            >
              {modoInfo.icon}
              {modoInfo.label}
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
              Custo Operacional: R$ 0,00
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
