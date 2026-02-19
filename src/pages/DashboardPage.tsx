import { useEffect, useState } from 'react';
import { BookOpen, Users, UserCheck, Building2, ClipboardList, TrendingUp, Euro } from 'lucide-react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Kurse, Dozenten, Teilnehmer, Raeume, Anmeldungen } from '@/types/app';
import type { Page } from '@/components/AppSidebar';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      LivingAppsService.getKurse(),
      LivingAppsService.getDozenten(),
      LivingAppsService.getTeilnehmer(),
      LivingAppsService.getRaeume(),
      LivingAppsService.getAnmeldungen(),
    ]).then(([k, d, t, r, a]) => {
      setKurse(k);
      setDozenten(d);
      setTeilnehmer(t);
      setRaeume(r);
      setAnmeldungen(a);
    }).finally(() => setLoading(false));
  }, []);

  const activeKurse = kurse.filter(k => k.fields.status === 'aktiv').length;
  const bezahltAnmeldungen = anmeldungen.filter(a => a.fields.bezahlt).length;
  const unbezahltAnmeldungen = anmeldungen.filter(a => !a.fields.bezahlt).length;
  const gesamtUmsatz = anmeldungen
    .filter(a => a.fields.bezahlt && a.fields.kurs)
    .reduce((sum, a) => {
      const kursId = a.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1];
      const kurs = kurse.find(k => k.record_id === kursId);
      return sum + (kurs?.fields.preis ?? 0);
    }, 0);

  const stats = [
    {
      label: 'Aktive Kurse',
      value: loading ? '–' : activeKurse.toString(),
      sub: `${kurse.length} gesamt`,
      icon: BookOpen,
      color: 'hsl(222, 47%, 18%)',
      bg: 'hsl(222, 47%, 96%)',
      onClick: () => onNavigate('kurse'),
    },
    {
      label: 'Dozenten',
      value: loading ? '–' : dozenten.length.toString(),
      sub: 'Lehrende',
      icon: UserCheck,
      color: 'hsl(210, 70%, 45%)',
      bg: 'hsl(210, 70%, 95%)',
      onClick: () => onNavigate('dozenten'),
    },
    {
      label: 'Teilnehmer',
      value: loading ? '–' : teilnehmer.length.toString(),
      sub: 'Registriert',
      icon: Users,
      color: 'hsl(280, 50%, 50%)',
      bg: 'hsl(280, 50%, 96%)',
      onClick: () => onNavigate('teilnehmer'),
    },
    {
      label: 'Räume',
      value: loading ? '–' : raeume.length.toString(),
      sub: 'Verfügbar',
      icon: Building2,
      color: 'hsl(160, 55%, 40%)',
      bg: 'hsl(160, 55%, 94%)',
      onClick: () => onNavigate('raeume'),
    },
  ];

  const recentAnmeldungen = [...anmeldungen]
    .sort((a, b) => new Date(b.fields.anmeldedatum ?? 0).getTime() - new Date(a.fields.anmeldedatum ?? 0).getTime())
    .slice(0, 6);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Übersicht</h1>
          <p className="page-subtitle">Alle wichtigen Kennzahlen auf einen Blick</p>
        </div>
      </div>

      {/* Hero + Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Hero KPI */}
        <div className="kpi-hero" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, opacity: 0.65, marginBottom: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Anmeldungen gesamt
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
                {loading ? '–' : anmeldungen.length}
              </div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.7, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'hsl(142, 71%, 70%)' }}>✓ {bezahltAnmeldungen} bezahlt</span>
                <span style={{ color: 'hsl(0, 84%, 75%)' }}>✕ {unbezahltAnmeldungen} offen</span>
              </div>
            </div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'hsl(0, 0%, 100% / 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ClipboardList size={26} style={{ opacity: 0.9 }} />
            </div>
          </div>
        </div>

        {/* Umsatz KPI */}
        <div className="kpi-card" style={{ background: 'var(--gradient-accent)', border: 'none', boxShadow: 'var(--shadow-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'hsl(222, 47%, 18% / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Euro size={18} style={{ color: 'hsl(222, 47%, 18%)' }} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(222, 47%, 12%)' }}>
            {loading ? '–' : `${gesamtUmsatz.toLocaleString('de-DE')} €`}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(222, 47%, 28%)', marginTop: '0.25rem' }}>
            Umsatz (bezahlt)
          </div>
        </div>

        {/* Trend */}
        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'hsl(160, 55%, 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} style={{ color: 'hsl(160, 55%, 40%)' }} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--foreground)' }}>
            {loading ? '–' : anmeldungen.length > 0 ? `${Math.round((bezahltAnmeldungen / anmeldungen.length) * 100)}%` : '–'}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Bezahlquote
          </div>
        </div>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="kpi-card"
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginTop: '0.125rem' }}>{stat.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.125rem' }}>{stat.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Recent Anmeldungen + Kurse Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent registrations */}
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Letzte Anmeldungen</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Die neuesten Einträge</div>
            </div>
            <button onClick={() => onNavigate('anmeldungen')} style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Alle anzeigen →
            </button>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Lädt...</div>
            ) : recentAnmeldungen.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Keine Anmeldungen vorhanden</div>
            ) : recentAnmeldungen.map(a => {
              const teilnehmerId = a.fields.teilnehmer?.match(/([a-f0-9]{24})$/i)?.[1];
              const kursId = a.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1];
              const tn = teilnehmer.find(t => t.record_id === teilnehmerId);
              const k = kurse.find(k => k.record_id === kursId);
              return (
                <div key={a.record_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tn?.fields.name ?? '–'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{k?.fields.titel ?? '–'}</div>
                  </div>
                  <span className={a.fields.bezahlt ? 'badge-paid' : 'badge-unpaid'}>
                    {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kurse overview */}
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Kurse nach Status</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Aktuelle Kursübersicht</div>
            </div>
            <button onClick={() => onNavigate('kurse')} style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Alle anzeigen →
            </button>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Lädt...</div>
            ) : kurse.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Keine Kurse vorhanden</div>
            ) : (
              <>
                {(['aktiv', 'geplant', 'abgeschlossen', 'abgesagt'] as const).map(status => {
                  const count = kurse.filter(k => k.fields.status === status).length;
                  const colors: Record<string, { bg: string; text: string }> = {
                    aktiv: { bg: 'hsl(142, 71%, 92%)', text: 'hsl(142, 71%, 28%)' },
                    geplant: { bg: 'hsl(210, 70%, 92%)', text: 'hsl(210, 70%, 30%)' },
                    abgeschlossen: { bg: 'hsl(220, 14%, 91%)', text: 'hsl(220, 9%, 40%)' },
                    abgesagt: { bg: 'hsl(0, 84%, 94%)', text: 'hsl(0, 84%, 40%)' },
                  };
                  const labels: Record<string, string> = { aktiv: 'Aktiv', geplant: 'Geplant', abgeschlossen: 'Abgeschlossen', abgesagt: 'Abgesagt' };
                  return (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: colors[status].text }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{labels[status]}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="capacity-bar" style={{ width: 80 }}>
                          <div className="capacity-fill" style={{
                            width: `${kurse.length > 0 ? (count / kurse.length) * 100 : 0}%`,
                            background: colors[status].text,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', minWidth: 20, textAlign: 'right' }}>{count}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
