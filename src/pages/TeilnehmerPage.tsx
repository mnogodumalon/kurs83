import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Teilnehmer } from '@/types/app';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const emptyForm = { name: '', email: '', telefon: '', geburtsdatum: '' };

export default function TeilnehmerPage() {
  const [items, setItems] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Teilnehmer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Teilnehmer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => LivingAppsService.getTeilnehmer().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    (i.fields.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Teilnehmer) => {
    setEditing(item);
    setForm({ name: item.fields.name ?? '', email: item.fields.email ?? '', telefon: item.fields.telefon ?? '', geburtsdatum: item.fields.geburtsdatum ?? '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields: Teilnehmer['fields'] = { ...form };
      if (!fields.geburtsdatum) delete fields.geburtsdatum;
      if (editing) {
        await LivingAppsService.updateTeilnehmerEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
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
      await LivingAppsService.deleteTeilnehmerEntry(deleteTarget.record_id);
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teilnehmer</h1>
          <p className="page-subtitle">{items.length} Teilnehmer registriert</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> Teilnehmer hinzufügen
        </Button>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Lädt...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>Keine Teilnehmer gefunden</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Geburtsdatum</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.record_id}>
                  <td style={{ fontWeight: 600 }}>{item.fields.name ?? '–'}</td>
                  <td style={{ color: 'var(--muted-foreground)' }}>{item.fields.email ?? '–'}</td>
                  <td>{item.fields.telefon ?? '–'}</td>
                  <td>{formatDate(item.fields.geburtsdatum)}</td>
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
            <DialogTitle>{editing ? 'Teilnehmer bearbeiten' : 'Neuen Teilnehmer hinzufügen'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div>
              <Label className="form-label">Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Vollständiger Name" />
            </div>
            <div>
              <Label className="form-label">E-Mail *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@beispiel.de" />
            </div>
            <div>
              <Label className="form-label">Telefon</Label>
              <Input value={form.telefon} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))} placeholder="+49 ..." />
            </div>
            <div>
              <Label className="form-label">Geburtsdatum</Label>
              <Input type="date" value={form.geburtsdatum} onChange={e => setForm(p => ({ ...p, geburtsdatum: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.email} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600 }}>
              {saving ? 'Wird gespeichert...' : editing ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Teilnehmer löschen"
        description={`Möchten Sie "${deleteTarget?.fields.name}" wirklich löschen?`}
      />
    </div>
  );
}
