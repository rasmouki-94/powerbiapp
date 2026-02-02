import { useEffect, useState } from 'react';
import { api } from '../api';
import { Template, TEMPLATE_TYPES } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function TemplateForm({ initial, onSave, onCancel }: {
  initial?: Template;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    nom: initial?.nom || '',
    type: initial?.type || 'remerciement',
    contenu: initial?.contenu || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[var(--chatgpt-surface)] border border-[var(--chatgpt-border)] rounded-lg p-4 mb-4">
      <div className="space-y-3">
        <input placeholder="Nom du template *" className="w-full border border-[var(--chatgpt-border)] bg-[var(--chatgpt-surface-elevated)] rounded px-3 py-2 text-sm text-[var(--chatgpt-text)] placeholder:text-[var(--chatgpt-subtle)]" value={form.nom} onChange={e => set('nom', e.target.value)} />
        <select className="w-full border border-[var(--chatgpt-border)] bg-[var(--chatgpt-surface-elevated)] rounded px-3 py-2 text-sm text-[var(--chatgpt-text)]" value={form.type} onChange={e => set('type', e.target.value)}>
          {Object.entries(TEMPLATE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <textarea
          placeholder="Contenu du message. Variables: {prénom}, {nom}, {entreprise}, {poste}, {douleurs_avatar}"
          className="w-full border border-[var(--chatgpt-border)] bg-[var(--chatgpt-surface-elevated)] rounded px-3 py-2 text-sm font-mono text-[var(--chatgpt-text)] placeholder:text-[var(--chatgpt-subtle)]"
          rows={6} value={form.contenu} onChange={e => set('contenu', e.target.value)}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave(form)} disabled={!form.nom} className="px-4 py-2 bg-[var(--chatgpt-accent)] text-white rounded text-sm hover:bg-[var(--chatgpt-accent-hover)] disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-[var(--chatgpt-border)] rounded text-sm hover:bg-[var(--chatgpt-surface-elevated)]">Annuler</button>
      </div>
    </div>
  );
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => { api.getTemplates().then(setTemplates); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (data: any) => { await api.createTemplate(data); setShowForm(false); load(); };
  const handleUpdate = async (data: any) => { if (editingId) await api.updateTemplate(editingId, data); setEditingId(null); load(); };
  const handleDelete = async (id: number) => { if (!confirm('Supprimer ce template ?')) return; await api.deleteTemplate(id); load(); };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Templates de messages ({templates.length})</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-1 px-3 py-2 bg-[var(--chatgpt-accent)] text-white rounded text-sm hover:bg-[var(--chatgpt-accent-hover)]">
          <Plus size={16} /> Nouveau template
        </button>
      </div>

      {showForm && <TemplateForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {templates.map(t => (
          editingId === t.id ? (
            <TemplateForm key={t.id} initial={t} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={t.id} className="bg-[var(--chatgpt-surface)] border border-[var(--chatgpt-border)] rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{t.nom}</h3>
                  <span className="text-xs px-2 py-0.5 bg-[var(--chatgpt-accent)]/20 text-[#a7f3d0] rounded">{TEMPLATE_TYPES[t.type] || t.type}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(t.id); setShowForm(false); }} className="p-1.5 hover:bg-[var(--chatgpt-surface-elevated)] rounded"><Pencil size={16} className="text-[var(--chatgpt-muted)]" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-500/10 rounded"><Trash2 size={16} className="text-red-300" /></button>
                </div>
              </div>
              <pre className="bg-[var(--chatgpt-surface-elevated)] border border-[var(--chatgpt-border)] rounded p-3 text-sm whitespace-pre-wrap font-sans">{t.contenu}</pre>
            </div>
          )
        ))}
        {templates.length === 0 && !showForm && (
          <div className="text-center py-12 text-[var(--chatgpt-subtle)]">Aucun template. Créez votre premier modèle de message.</div>
        )}
      </div>
    </div>
  );
}
