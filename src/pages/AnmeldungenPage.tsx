import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ClipboardList } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import type { Anmeldungen, Teilnehmer, Kurse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const emptyForm = { teilnehmerId: '', kursId: '', anmeldedatum: '', bezahlt: false };

export default function AnmeldungenPage() {
  const [items, setItems] = useState<Anmeldungen[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Anmeldungen | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Anmeldungen | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const [a, t, k] = await Promise.all([LivingAppsService.getAnmeldungen(), LivingAppsService.getTeilnehmer(), LivingAppsService.getKurse()]);
    setItems(a); setTeilnehmer(t); setKurse(k); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getTNName = (url?: string) => {
    const id = url?.match(/([a-f0-9]{24})$/i)?.[1];
    return teilnehmer.find(t => t.record_id === id)?.fields.name ?? '–';
  };
  const getKursName = (url?: string) => {
    const id = url?.match(/([a-f0-9]{24})$/i)?.[1];
    return kurse.find(k => k.record_id === id)?.fields.titel ?? '–';
  };

  const filtered = items.filter(i => {
    const tn = getTNName(i.fields.teilnehmer).toLowerCase();
    const k = getKursName(i.fields.kurs).toLowerCase();
    const q = search.toLowerCase();
    return tn.includes(q) || k.includes(q);
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, anmeldedatum: new Date().toISOString().split('T')[0] });
    setDialogOpen(true);
  };
  const openEdit = (item: Anmeldungen) => {
    const teilnehmerId = item.fields.teilnehmer?.match(/([a-f0-9]{24})$/i)?.[1] ?? '';
    const kursId = item.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1] ?? '';
    setEditing(item);
    setForm({ teilnehmerId, kursId, anmeldedatum: item.fields.anmeldedatum ?? '', bezahlt: item.fields.bezahlt ?? false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields: Anmeldungen['fields'] = {
        teilnehmer: form.teilnehmerId ? createRecordUrl(APP_IDS.TEILNEHMER, form.teilnehmerId) : undefined,
        kurs: form.kursId ? createRecordUrl(APP_IDS.KURSE, form.kursId) : undefined,
        anmeldedatum: form.anmeldedatum || undefined,
        bezahlt: form.bezahlt,
      };
      if (editing) {
        await LivingAppsService.updateAnmeldungenEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
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
      await LivingAppsService.deleteAnmeldungenEntry(deleteTarget.record_id);
      await load();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleBezahlt = async (item: Anmeldungen) => {
    await LivingAppsService.updateAnmeldungenEntry(item.record_id, { bezahlt: !item.fields.bezahlt });
    await load();
  };

  const formatDate = (d?: string) => {
    if (!d) return '–';
    try { return format(new Date(d), 'dd.MM.yyyy', { locale: de }); }
    catch { return d; }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Anmeldungen</h1>
          <p className="page-subtitle">
            {items.length} Anmeldungen · {items.filter(i => i.fields.bezahlt).length} bezahlt · {items.filter(i => !i.fields.bezahlt).length} offen
          </p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> Anmeldung erfassen
        </Button>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input placeholder="Teilnehmer oder Kurs suchen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Lädt...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <ClipboardList size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>Keine Anmeldungen gefunden</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Teilnehmer</th>
                <th>Kurs</th>
                <th>Anmeldedatum</th>
                <th>Bezahlstatus</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.record_id}>
                  <td style={{ fontWeight: 600 }}>{getTNName(item.fields.teilnehmer)}</td>
                  <td style={{ color: 'var(--muted-foreground)' }}>{getKursName(item.fields.kurs)}</td>
                  <td>{formatDate(item.fields.anmeldedatum)}</td>
                  <td>
                    <button
                      onClick={() => handleToggleBezahlt(item)}
                      className={item.fields.bezahlt ? 'badge-paid' : 'badge-unpaid'}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Klicken zum Wechseln"
                    >
                      {item.fields.bezahlt ? '✓ Bezahlt' : '✕ Offen'}
                    </button>
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={v => !v && setDialogOpen(false)}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Anmeldung bearbeiten' : 'Neue Anmeldung erfassen'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div>
              <Label className="form-label">Teilnehmer *</Label>
              <select value={form.teilnehmerId} onChange={e => setForm(p => ({ ...p, teilnehmerId: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                <option value="">– Teilnehmer wählen –</option>
                {teilnehmer.map(t => <option key={t.record_id} value={t.record_id}>{t.fields.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="form-label">Kurs *</Label>
              <select value={form.kursId} onChange={e => setForm(p => ({ ...p, kursId: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                <option value="">– Kurs wählen –</option>
                {kurse.map(k => <option key={k.record_id} value={k.record_id}>{k.fields.titel}</option>)}
              </select>
            </div>
            <div>
              <Label className="form-label">Anmeldedatum *</Label>
              <Input type="date" value={form.anmeldedatum} onChange={e => setForm(p => ({ ...p, anmeldedatum: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="bezahlt"
                checked={form.bezahlt}
                onChange={e => setForm(p => ({ ...p, bezahlt: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <Label htmlFor="bezahlt" style={{ cursor: 'pointer', marginBottom: 0 }}>Bereits bezahlt</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.teilnehmerId || !form.kursId || !form.anmeldedatum}
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600 }}>
              {saving ? 'Wird gespeichert...' : editing ? 'Speichern' : 'Erfassen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Anmeldung löschen"
        description={`Möchten Sie diese Anmeldung wirklich löschen?`}
      />
    </div>
  );
}
