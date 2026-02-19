import { useState } from 'react';
import AppSidebar, { type Page } from '@/components/AppSidebar';
import DashboardPage from '@/pages/DashboardPage';
import KursePage from '@/pages/KursePage';
import DozentPage from '@/pages/DozentPage';
import TeilnehmerPage from '@/pages/TeilnehmerPage';
import RaeuemPage from '@/pages/RaeuemPage';
import AnmeldungenPage from '@/pages/AnmeldungenPage';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigate={setCurrentPage} />;
      case 'kurse': return <KursePage />;
      case 'dozenten': return <DozentPage />;
      case 'teilnehmer': return <TeilnehmerPage />;
      case 'raeume': return <RaeuemPage />;
      case 'anmeldungen': return <AnmeldungenPage />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content" style={{ flex: 1 }}>
        {renderPage()}
      </main>
    </div>
  );
}
