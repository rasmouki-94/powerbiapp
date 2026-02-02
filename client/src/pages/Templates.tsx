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
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="space-y-3">
        <input placeholder="Nom du template *" className="w-full border rounded px-3 py-2 text-sm" value={form.nom} onChange={e => set('nom', e.target.value)} />
        <select className="w-full border rounded px-3 py-2 text-sm" value={form.type} onChange={e => set('type', e.target.value)}>
          {Object.entries(TEMPLATE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <textarea
          placeholder="Contenu du message. Variables: {prénom}, {nom}, {entreprise}, {poste}, {douleurs_avatar}"
          className="w-full border rounded px-3 py-2 text-sm font-mono"
          rows={6} value={form.contenu} onChange={e => set('contenu', e.target.value)}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave(form)} disabled={!form.nom} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Annuler</button>
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
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          <Plus size={16} /> Nouveau template
        </button>
      </div>

      {showForm && <TemplateForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {templates.map(t => (
          editingId === t.id ? (
            <TemplateForm key={t.id} initial={t} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={t.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{t.nom}</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{TEMPLATE_TYPES[t.type] || t.type}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(t.id); setShowForm(false); }} className="p-1.5 hover:bg-gray-100 rounded"><Pencil size={16} className="text-gray-500" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={16} className="text-red-400" /></button>
                </div>
              </div>
              <pre className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap font-sans">{t.contenu}</pre>
            </div>
          )
        ))}
        {templates.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">Aucun template. Créez votre premier modèle de message.</div>
        )}
      </div>
    </div>
  );
}
