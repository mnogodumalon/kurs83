import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import type { Kurse, Dozenten, Raeume } from '@/types/app';
import { APP_IDS } from '@/types/app';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = { aktiv: 'Aktiv', geplant: 'Geplant', abgeschlossen: 'Abgeschlossen', abgesagt: 'Abgesagt' };
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  aktiv: { bg: 'hsl(142, 71%, 92%)', text: 'hsl(142, 71%, 28%)' },
  geplant: { bg: 'hsl(210, 70%, 92%)', text: 'hsl(210, 70%, 30%)' },
  abgeschlossen: { bg: 'hsl(220, 14%, 91%)', text: 'hsl(220, 9%, 40%)' },
  abgesagt: { bg: 'hsl(0, 84%, 94%)', text: 'hsl(0, 84%, 40%)' },
};

const emptyForm = { titel: '', beschreibung: '', startdatum: '', enddatum: '', max_teilnehmer: '', preis: '', dozentId: '', raumId: '', status: 'geplant' as Kurse['fields']['status'] };

export default function KursePage() {
  const [items, setItems] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Kurse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Kurse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const [k, d, r] = await Promise.all([LivingAppsService.getKurse(), LivingAppsService.getDozenten(), LivingAppsService.getRaeume()]);
    setItems(k); setDozenten(d); setRaeume(r); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    (i.fields.titel ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Kurse) => {
    const dozentId = item.fields.dozent?.match(/([a-f0-9]{24})$/i)?.[1] ?? '';
    const raumId = item.fields.raum?.match(/([a-f0-9]{24})$/i)?.[1] ?? '';
    setEditing(item);
    setForm({
      titel: item.fields.titel ?? '',
      beschreibung: item.fields.beschreibung ?? '',
      startdatum: item.fields.startdatum ?? '',
      enddatum: item.fields.enddatum ?? '',
      max_teilnehmer: item.fields.max_teilnehmer?.toString() ?? '',
      preis: item.fields.preis?.toString() ?? '',
      dozentId,
      raumId,
      status: item.fields.status ?? 'geplant',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields: Kurse['fields'] = {
        titel: form.titel,
        beschreibung: form.beschreibung || undefined,
        startdatum: form.startdatum || undefined,
        enddatum: form.enddatum || undefined,
        max_teilnehmer: form.max_teilnehmer ? Number(form.max_teilnehmer) : undefined,
        preis: form.preis ? Number(form.preis) : undefined,
        dozent: form.dozentId ? createRecordUrl(APP_IDS.DOZENTEN, form.dozentId) : undefined,
        raum: form.raumId ? createRecordUrl(APP_IDS.RAEUME, form.raumId) : undefined,
        status: form.status,
      };
      if (editing) {
        await LivingAppsService.updateKurseEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createKurseEntry(fields);
      }
      await load();
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await LivingAppsService.deleteKurseEntry(deleteTarget.record_id);
      await load();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '–';
    try { return format(new Date(d), 'dd.MM.yyyy', { locale: de }); }
    catch { return d; }
  };

  const getDozentName = (url?: string) => {
    const id = url?.match(/([a-f0-9]{24})$/i)?.[1];
    return dozenten.find(d => d.record_id === id)?.fields.name ?? '–';
  };

  const getRaumName = (url?: string) => {
    const id = url?.match(/([a-f0-9]{24})$/i)?.[1];
    return raeume.find(r => r.record_id === id)?.fields.raumname ?? '–';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kurse</h1>
          <p className="page-subtitle">{items.length} Kurse insgesamt</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> Kurs erstellen
        </Button>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input placeholder="Kurs suchen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Lädt...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <BookOpen size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>Keine Kurse gefunden</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Dozent</th>
                <th>Raum</th>
                <th>Zeitraum</th>
                <th>Preis</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const sc = STATUS_COLORS[item.fields.status ?? 'geplant'] ?? STATUS_COLORS.geplant;
                return (
                  <tr key={item.record_id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.fields.titel ?? '–'}</div>
                      {item.fields.max_teilnehmer && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Max. {item.fields.max_teilnehmer} TN</div>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted-foreground)' }}>{getDozentName(item.fields.dozent)}</td>
                    <td style={{ color: 'var(--muted-foreground)' }}>{getRaumName(item.fields.raum)}</td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{formatDate(item.fields.startdatum)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>bis {formatDate(item.fields.enddatum)}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {item.fields.preis != null ? `${item.fields.preis.toLocaleString('de-DE')} €` : '–'}
                    </td>
                    <td>
                      <span style={{ background: sc.bg, color: sc.text, padding: '0.2rem 0.625rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600 }}>
                        {STATUS_LABELS[item.fields.status ?? 'geplant']}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)} style={{ padding: '0.375rem' }}>
                          <Pencil size={15} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)} style={{ padding: '0.375rem', color: 'var(--destructive)' }}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={v => !v && setDialogOpen(false)}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', padding: '0.5rem 0' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Label className="form-label">Titel *</Label>
              <Input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} placeholder="Kurstitel" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <Label className="form-label">Beschreibung</Label>
              <Textarea value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))} placeholder="Kurzbeschreibung..." rows={2} />
            </div>
            <div>
              <Label className="form-label">Startdatum *</Label>
              <Input type="date" value={form.startdatum} onChange={e => setForm(p => ({ ...p, startdatum: e.target.value }))} />
            </div>
            <div>
              <Label className="form-label">Enddatum</Label>
              <Input type="date" value={form.enddatum} onChange={e => setForm(p => ({ ...p, enddatum: e.target.value }))} />
            </div>
            <div>
              <Label className="form-label">Max. Teilnehmer</Label>
              <Input type="number" min="1" value={form.max_teilnehmer} onChange={e => setForm(p => ({ ...p, max_teilnehmer: e.target.value }))} placeholder="z.B. 20" />
            </div>
            <div>
              <Label className="form-label">Preis (€)</Label>
              <Input type="number" min="0" step="0.01" value={form.preis} onChange={e => setForm(p => ({ ...p, preis: e.target.value }))} placeholder="z.B. 299.00" />
            </div>
            <div>
              <Label className="form-label">Dozent</Label>
              <select value={form.dozentId} onChange={e => setForm(p => ({ ...p, dozentId: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                <option value="">– Kein Dozent –</option>
                {dozenten.map(d => <option key={d.record_id} value={d.record_id}>{d.fields.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="form-label">Raum</Label>
              <select value={form.raumId} onChange={e => setForm(p => ({ ...p, raumId: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                <option value="">– Kein Raum –</option>
                {raeume.map(r => <option key={r.record_id} value={r.record_id}>{r.fields.raumname}{r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ''}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <Label className="form-label">Status</Label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Kurse['fields']['status'] }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                <option value="geplant">Geplant</option>
                <option value="aktiv">Aktiv</option>
                <option value="abgeschlossen">Abgeschlossen</option>
                <option value="abgesagt">Abgesagt</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.titel || !form.startdatum} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600 }}>
              {saving ? 'Wird gespeichert...' : editing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Kurs löschen"
        description={`Möchten Sie "${deleteTarget?.fields.titel}" wirklich löschen?`}
      />
    </div>
  );
}
