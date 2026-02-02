import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Avatar, Prospect, STATUT_LABELS, STATUT_COLORS, PIPELINE_ORDER } from '../types';
import { Plus, Upload, Search, X } from 'lucide-react';

function ProspectForm({ avatars, initial, onSave, onCancel }: {
  avatars: Avatar[];
  initial?: Partial<Prospect>;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    prenom: initial?.prenom || '',
    nom: initial?.nom || '',
    entreprise: initial?.entreprise || '',
    poste: initial?.poste || '',
    url_linkedin: initial?.url_linkedin || '',
    avatar_id: initial?.avatar_id || '',
    statut: initial?.statut || 'demande_envoyee',
    notes: initial?.notes || '',
    date_connexion: initial?.date_connexion?.split('T')[0] || '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Prénom *" className="border rounded px-3 py-2 text-sm" value={form.prenom} onChange={e => set('prenom', e.target.value)} />
        <input placeholder="Nom *" className="border rounded px-3 py-2 text-sm" value={form.nom} onChange={e => set('nom', e.target.value)} />
        <input placeholder="Entreprise" className="border rounded px-3 py-2 text-sm" value={form.entreprise} onChange={e => set('entreprise', e.target.value)} />
        <input placeholder="Poste" className="border rounded px-3 py-2 text-sm" value={form.poste} onChange={e => set('poste', e.target.value)} />
        <input placeholder="URL LinkedIn" className="border rounded px-3 py-2 text-sm col-span-2" value={form.url_linkedin} onChange={e => set('url_linkedin', e.target.value)} />
        <select className="border rounded px-3 py-2 text-sm" value={form.avatar_id} onChange={e => set('avatar_id', e.target.value)}>
          <option value="">-- Avatar --</option>
          {avatars.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={form.statut} onChange={e => set('statut', e.target.value)}>
          {PIPELINE_ORDER.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
        <input type="date" className="border rounded px-3 py-2 text-sm" value={form.date_connexion} onChange={e => set('date_connexion', e.target.value)} placeholder="Date connexion" />
        <textarea placeholder="Notes" className="border rounded px-3 py-2 text-sm col-span-2" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave({ ...form, avatar_id: form.avatar_id ? Number(form.avatar_id) : null })}
          disabled={!form.prenom || !form.nom}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Annuler</button>
      </div>
    </div>
  );
}

export default function Prospects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterAvatar, setFilterAvatar] = useState('');
  const navigate = useNavigate();

  const load = () => {
    api.getProspects().then(setProspects);
    api.getAvatars().then(setAvatars);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (data: any) => {
    await api.createProspect(data);
    setShowForm(false);
    load();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await api.importCsv(file);
    alert(`${result.imported} prospects importés`);
    load();
    e.target.value = '';
  };

  const filtered = prospects.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!`${p.prenom} ${p.nom} ${p.entreprise} ${p.poste}`.toLowerCase().includes(q)) return false;
    }
    if (filterStatut && p.statut !== filterStatut) return false;
    if (filterAvatar && p.avatar_id !== Number(filterAvatar)) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Prospects ({prospects.length})</h1>
        <div className="flex gap-2">
          <label className="flex items-center gap-1 px-3 py-2 border rounded text-sm cursor-pointer hover:bg-gray-50">
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {showForm && <ProspectForm avatars={avatars} onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input placeholder="Rechercher..." className="w-full border rounded pl-9 pr-3 py-2 text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border rounded px-3 py-2 text-sm" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {PIPELINE_ORDER.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={filterAvatar} onChange={e => setFilterAvatar(e.target.value)}>
          <option value="">Tous les avatars</option>
          {avatars.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nom</th>
              <th className="text-left px-4 py-3 font-medium">Entreprise</th>
              <th className="text-left px-4 py-3 font-medium">Poste</th>
              <th className="text-left px-4 py-3 font-medium">Avatar</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-left px-4 py-3 font-medium">Connexion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/prospects/${p.id}`)}>
                <td className="px-4 py-3 font-medium">{p.prenom} {p.nom}</td>
                <td className="px-4 py-3 text-gray-600">{p.entreprise}</td>
                <td className="px-4 py-3 text-gray-600">{p.poste}</td>
                <td className="px-4 py-3 text-gray-500">{p.avatar_nom || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUT_COLORS[p.statut]}`}>
                    {STATUT_LABELS[p.statut]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.date_connexion?.split('T')[0] || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun prospect trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
