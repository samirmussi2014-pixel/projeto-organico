import { useState } from 'react';
import { Layout, type PageId } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { RadarCargasPage } from '@/pages/RadarCargasPage';
import { RadarEmbarcadoresPage } from '@/pages/RadarEmbarcadoresPage';
import { RadarTransportadoresPage } from '@/pages/RadarTransportadoresPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { OportunidadesPage } from '@/pages/OportunidadesPage';
import { EmpresasPage } from '@/pages/EmpresasPage';
import { FontesPage } from '@/pages/FontesPage';
import { RotasPage } from '@/pages/RotasPage';
import { PalavrasChavePage } from '@/pages/PalavrasChavePage';
import { ConteudoPage } from '@/pages/ConteudoPage';
import { SEOPage } from '@/pages/SEOPage';
import { TarefasPage } from '@/pages/TarefasPage';
import { RelatorioDiarioPage } from '@/pages/RelatorioDiarioPage';
import { RelatorioSemanalPage } from '@/pages/RelatorioSemanalPage';
import { MemoriaPage } from '@/pages/MemoriaPage';
import { ConfiguracoesPage } from '@/pages/ConfiguracoesPage';

function App() {
  const [page, setPage] = useState<PageId>('dashboard');

  function renderPage() {
    switch (page) {
      case 'dashboard': return <DashboardPage onNavigate={setPage} />;
      case 'radar-cargas': return <RadarCargasPage />;
      case 'radar-embarcadores': return <RadarEmbarcadoresPage />;
      case 'radar-transportadores': return <RadarTransportadoresPage />;
      case 'leads': return <LeadsPage />;
      case 'oportunidades': return <OportunidadesPage />;
      case 'empresas': return <EmpresasPage />;
      case 'fontes': return <FontesPage />;
      case 'rotas': return <RotasPage />;
      case 'palavras-chave': return <PalavrasChavePage />;
      case 'conteudo': return <ConteudoPage />;
      case 'seo': return <SEOPage />;
      case 'tarefas': return <TarefasPage />;
      case 'relatorio-diario': return <RelatorioDiarioPage />;
      case 'relatorio-semanal': return <RelatorioSemanalPage />;
      case 'memoria': return <MemoriaPage />;
      case 'configuracoes': return <ConfiguracoesPage />;
      default: return <DashboardPage onNavigate={setPage} />;
    }
  }

  return (
    <Layout current={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
