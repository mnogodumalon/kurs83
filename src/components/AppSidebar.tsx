import { BookOpen, Users, UserCheck, Building2, ClipboardList, LayoutDashboard } from 'lucide-react';

export type Page = 'dashboard' | 'kurse' | 'dozenten' | 'teilnehmer' | 'raeume' | 'anmeldungen';

interface AppSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.FC<any>; count?: number }[] = [
  { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'kurse', label: 'Kurse', icon: BookOpen },
  { id: 'dozenten', label: 'Dozenten', icon: UserCheck },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: Users },
  { id: 'raeume', label: 'Räume', icon: Building2 },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: ClipboardList },
];

export default function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'var(--sidebar)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--sidebar-border)',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BookOpen size={18} style={{ color: 'hsl(222, 47%, 12%)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'hsl(0, 0%, 98%)', letterSpacing: '-0.02em' }}>
              KursManager
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'hsl(220, 20%, 55%)', fontWeight: 500 }}>
              Verwaltungssystem
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '0.75rem', overflow: 'auto' }}>
        <div style={{ padding: '0 0.5rem 0.25rem', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(220, 20%, 45%)', textTransform: 'uppercase', marginBottom: '0.375rem', paddingLeft: '1.25rem' }}>
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-nav-item${active ? ' active' : ''}`}
              style={{ width: 'calc(100% - 1rem)', textAlign: 'left' }}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'hsl(220, 20%, 40%)' }}>
          © 2026 KursManager
        </div>
      </div>
    </aside>
  );
}
