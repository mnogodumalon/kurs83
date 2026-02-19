import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Raeume } from '@/types/app';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

const emptyForm = { raumname: '', gebaeude: '', kapazitaet: '' };

export default function RaeuemPage() {
  const [items, setItems] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Raeume | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Raeume | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => LivingAppsService.getRaeume().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    (i.fields.raumname ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.gebaeude ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Raeume) => {
    setEditing(item);
    setForm({ raumname: item.fields.raumname ?? '', gebaeude: item.fields.gebaeude ?? '', kapazitaet: item.fields.kapazitaet?.toString() ?? '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields: Raeume['fields'] = {
        raumname: form.raumname,
        gebaeude: form.gebaeude || undefined,
        kapazitaet: form.kapazitaet ? Number(form.kapazitaet) : undefined,
      };
      if (editing) {
        await LivingAppsService.updateRaeumeEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
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
      await LivingAppsService.deleteRaeumeEntry(deleteTarget.record_id);
      await load();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const maxKapazitaet = Math.max(...items.map(i => i.fields.kapazitaet ?? 0), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Räume</h1>
          <p className="page-subtitle">{items.length} Räume verfügbar</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> Raum hinzufügen
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
            <Building2 size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>Keine Räume gefunden</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Raumname</th>
                <th>Gebäude</th>
                <th>Kapazität</th>
                <th style={{ width: 160 }}>Auslastung</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const pct = Math.round(((item.fields.kapazitaet ?? 0) / maxKapazitaet) * 100);
                return (
                  <tr key={item.record_id}>
                    <td style={{ fontWeight: 600 }}>{item.fields.raumname ?? '–'}</td>
                    <td style={{ color: 'var(--muted-foreground)' }}>{item.fields.gebaeude ?? '–'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{item.fields.kapazitaet ?? '–'}</span>
                      {item.fields.kapazitaet && <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}> Plätze</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="capacity-bar" style={{ flex: 1 }}>
                          <div className="capacity-fill" style={{
                            width: `${pct}%`,
                            background: pct > 80 ? 'hsl(0, 84%, 60%)' : pct > 50 ? 'hsl(38, 95%, 55%)' : 'hsl(160, 55%, 45%)',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', minWidth: 32, textAlign: 'right' }}>{item.fields.kapazitaet ?? 0}</span>
                      </div>
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
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Raum bearbeiten' : 'Neuen Raum hinzufügen'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div>
              <Label className="form-label">Raumname *</Label>
              <Input value={form.raumname} onChange={e => setForm(p => ({ ...p, raumname: e.target.value }))} placeholder="z.B. Raum A101" />
            </div>
            <div>
              <Label className="form-label">Gebäude</Label>
              <Input value={form.gebaeude} onChange={e => setForm(p => ({ ...p, gebaeude: e.target.value }))} placeholder="z.B. Hauptgebäude" />
            </div>
            <div>
              <Label className="form-label">Kapazität *</Label>
              <Input type="number" min="1" value={form.kapazitaet} onChange={e => setForm(p => ({ ...p, kapazitaet: e.target.value }))} placeholder="Anzahl Plätze" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.raumname || !form.kapazitaet} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600 }}>
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
        title="Raum löschen"
        description={`Möchten Sie "${deleteTarget?.fields.raumname}" wirklich löschen?`}
      />
    </div>
  );
}
