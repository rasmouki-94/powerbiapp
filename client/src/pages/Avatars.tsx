import { useEffect, useState } from 'react';
import { api } from '../api';
import { Avatar } from '../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

function AvatarForm({ initial, onSave, onCancel }: {
  initial?: Avatar;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    nom: initial?.nom || '',
    description: initial?.description || '',
    secteurs: initial?.secteurs || '',
    taille_entreprise: initial?.taille_entreprise || '',
    douleurs: (() => { try { return JSON.parse(initial?.douleurs || '[]').join('\n'); } catch { return ''; } })(),
    mots_cles_linkedin: initial?.mots_cles_linkedin || '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    onSave({
      ...form,
      douleurs: form.douleurs.split('\n').map((d: string) => d.trim()).filter(Boolean),
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Nom de l'avatar *" className="border rounded px-3 py-2 text-sm col-span-2" value={form.nom} onChange={e => set('nom', e.target.value)} />
        <textarea placeholder="Description du profil type" className="border rounded px-3 py-2 text-sm col-span-2" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        <input placeholder="Secteurs ciblés" className="border rounded px-3 py-2 text-sm" value={form.secteurs} onChange={e => set('secteurs', e.target.value)} />
        <input placeholder="Taille d'entreprise" className="border rounded px-3 py-2 text-sm" value={form.taille_entreprise} onChange={e => set('taille_entreprise', e.target.value)} />
        <textarea placeholder="Douleurs typiques (une par ligne)" className="border rounded px-3 py-2 text-sm col-span-2" rows={3} value={form.douleurs} onChange={e => set('douleurs', e.target.value)} />
        <input placeholder="Mots-clés LinkedIn" className="border rounded px-3 py-2 text-sm col-span-2" value={form.mots_cles_linkedin} onChange={e => set('mots_cles_linkedin', e.target.value)} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={submit} disabled={!form.nom} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Annuler</button>
      </div>
    </div>
  );
}

export default function Avatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => { api.getAvatars().then(setAvatars); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (data: any) => {
    await api.createAvatar(data);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (data: any) => {
    if (editingId) await api.updateAvatar(editingId, data);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet avatar ?')) return;
    await api.deleteAvatar(id);
    load();
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Avatars ({avatars.length})</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          <Plus size={16} /> Nouvel avatar
        </button>
      </div>

      {showForm && <AvatarForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {avatars.map(a => (
          editingId === a.id ? (
            <AvatarForm key={a.id} initial={a} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={a.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{a.nom}</h3>
                  {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-gray-500">
                    {a.secteurs && <span>Secteurs: {a.secteurs}</span>}
                    {a.taille_entreprise && <span>Taille: {a.taille_entreprise}</span>}
                    {a.mots_cles_linkedin && <span>Mots-clés: {a.mots_cles_linkedin}</span>}
                  </div>
                  {(() => {
                    let douleurs: string[] = [];
                    try { douleurs = JSON.parse(a.douleurs); } catch {}
                    return douleurs.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">Douleurs:</span>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {douleurs.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(a.id); setShowForm(false); }} className="p-1.5 hover:bg-gray-100 rounded"><Pencil size={16} className="text-gray-500" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={16} className="text-red-400" /></button>
                </div>
              </div>
            </div>
          )
        ))}
        {avatars.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">Aucun avatar. Créez votre premier avatar client.</div>
        )}
      </div>
    </div>
  );
}
