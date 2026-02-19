import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Dozenten } from '@/types/app';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

const emptyForm = { name: '', email: '', telefon: '', fachgebiet: '' };

export default function DozentPage() {
  const [items, setItems] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dozenten | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Dozenten | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => LivingAppsService.getDozenten().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    (i.fields.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.fachgebiet ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Dozenten) => {
    setEditing(item);
    setForm({ name: item.fields.name ?? '', email: item.fields.email ?? '', telefon: item.fields.telefon ?? '', fachgebiet: item.fields.fachgebiet ?? '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await LivingAppsService.updateDozentenEntry(editing.record_id, form);
      } else {
        await LivingAppsService.createDozentenEntry(form);
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
      await LivingAppsService.deleteDozentenEntry(deleteTarget.record_id);
      await load();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dozenten</h1>
          <p className="page-subtitle">{items.length} Dozenten registriert</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> Dozent hinzufügen
        </Button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Lädt...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <UserCheck size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>Keine Dozenten gefunden</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Fachgebiet</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.record_id}>
                  <td style={{ fontWeight: 600 }}>{item.fields.name ?? '–'}</td>
                  <td style={{ color: 'var(--muted-foreground)' }}>{item.fields.email ?? '–'}</td>
                  <td>{item.fields.telefon ?? '–'}</td>
                  <td>
                    {item.fields.fachgebiet ? (
                      <span style={{ background: 'hsl(222, 47%, 94%)', color: 'hsl(222, 47%, 30%)', padding: '0.2rem 0.625rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.fields.fachgebiet}
                      </span>
                    ) : '–'}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => !v && setDialogOpen(false)}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Dozent bearbeiten' : 'Neuen Dozent hinzufügen'}</DialogTitle>
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
              <Label className="form-label">Fachgebiet</Label>
              <Input value={form.fachgebiet} onChange={e => setForm(p => ({ ...p, fachgebiet: e.target.value }))} placeholder="z.B. Mathematik, Sprachen..." />
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
        title="Dozent löschen"
        description={`Möchten Sie "${deleteTarget?.fields.name}" wirklich löschen?`}
      />
    </div>
  );
}
