import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Avatar, Prospect, Template, Interaction, STATUT_LABELS, STATUT_COLORS, PIPELINE_ORDER, TEMPLATE_TYPES } from '../types';
import { ArrowLeft, Copy, Check, Trash2, ExternalLink } from 'lucide-react';

function replaceVariables(template: string, prospect: Prospect): string {
  let douleurs = '';
  try { douleurs = JSON.parse(prospect.avatar_douleurs || '[]').join(', '); } catch {}
  return template
    .replace(/\{prénom\}/g, prospect.prenom)
    .replace(/\{prenom\}/g, prospect.prenom)
    .replace(/\{nom\}/g, prospect.nom)
    .replace(/\{entreprise\}/g, prospect.entreprise)
    .replace(/\{poste\}/g, prospect.poste)
    .replace(/\{douleurs_avatar\}/g, douleurs);
}

export default function ProspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [newNote, setNewNote] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    api.getProspect(Number(id)).then(p => {
      setProspect(p);
      setForm({
        prenom: p.prenom, nom: p.nom, entreprise: p.entreprise, poste: p.poste,
        url_linkedin: p.url_linkedin, avatar_id: p.avatar_id || '', statut: p.statut,
        notes: p.notes, date_connexion: p.date_connexion?.split('T')[0] || '',
      });
    });
    api.getAvatars().then(setAvatars);
    api.getTemplates().then(setTemplates);
  };
  useEffect(load, [id]);

  if (!prospect) return <div className="p-8 text-gray-500">Chargement...</div>;

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    await api.updateProspect(prospect.id, { ...form, avatar_id: form.avatar_id ? Number(form.avatar_id) : null });
    setEditing(false);
    load();
  };

  const changeStatut = async (newStatut: string) => {
    await api.updateStatut(prospect.id, newStatut);
    load();
  };

  const addInteraction = async () => {
    if (!newNote.trim()) return;
    await api.createInteraction(prospect.id, { type_action: 'note', notes: newNote });
    setNewNote('');
    load();
  };

  const deleteProspect = async () => {
    if (!confirm('Supprimer ce prospect ?')) return;
    await api.deleteProspect(prospect.id);
    navigate('/prospects');
  };

  const message = selectedTemplate ? replaceVariables(selectedTemplate.contenu, prospect) : '';

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{prospect.prenom} {prospect.nom}</h1>
          <p className="text-gray-500">{prospect.poste} - {prospect.entreprise}</p>
          {prospect.url_linkedin && (
            <a href={prospect.url_linkedin} target="_blank" rel="noreferrer" className="text-blue-500 text-sm flex items-center gap-1 mt-1 hover:underline">
              <ExternalLink size={14} /> Profil LinkedIn
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">
            {editing ? 'Annuler' : 'Modifier'}
          </button>
          <button onClick={deleteProspect} className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2 text-sm" value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Prénom" />
            <input className="border rounded px-3 py-2 text-sm" value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Nom" />
            <input className="border rounded px-3 py-2 text-sm" value={form.entreprise} onChange={e => set('entreprise', e.target.value)} placeholder="Entreprise" />
            <input className="border rounded px-3 py-2 text-sm" value={form.poste} onChange={e => set('poste', e.target.value)} placeholder="Poste" />
            <input className="border rounded px-3 py-2 text-sm col-span-2" value={form.url_linkedin} onChange={e => set('url_linkedin', e.target.value)} placeholder="URL LinkedIn" />
            <select className="border rounded px-3 py-2 text-sm" value={form.avatar_id} onChange={e => set('avatar_id', e.target.value)}>
              <option value="">-- Avatar --</option>
              {avatars.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
            <input type="date" className="border rounded px-3 py-2 text-sm" value={form.date_connexion} onChange={e => set('date_connexion', e.target.value)} />
            <textarea className="border rounded px-3 py-2 text-sm col-span-2" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes" />
          </div>
          <button onClick={save} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Enregistrer</button>
        </div>
      ) : null}

      {/* Statut */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Statut du pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_ORDER.map(s => (
            <button
              key={s}
              onClick={() => changeStatut(s)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                prospect.statut === s ? STATUT_COLORS[s] + ' ring-2 ring-offset-1 ring-blue-400' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              {STATUT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Templates & messages */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Envoyer un message</h2>
        <select
          className="w-full border rounded px-3 py-2 text-sm mb-3"
          value={selectedTemplate?.id || ''}
          onChange={e => setSelectedTemplate(templates.find(t => t.id === Number(e.target.value)) || null)}
        >
          <option value="">-- Choisir un template --</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.nom} ({TEMPLATE_TYPES[t.type] || t.type})</option>
          ))}
        </select>
        {message && (
          <>
            <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap mb-3">{message}</div>
            <button onClick={copyMessage} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier le message'}
            </button>
          </>
        )}
      </div>

      {/* Add interaction */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Ajouter une note / interaction</h2>
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Note..." value={newNote} onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addInteraction()} />
          <button onClick={addInteraction} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Ajouter</button>
        </div>
      </div>

      {/* Interaction history */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Historique des interactions</h2>
        {prospect.interactions && prospect.interactions.length > 0 ? (
          <div className="space-y-2">
            {prospect.interactions.map((i: Interaction) => (
              <div key={i.id} className="flex items-start gap-3 text-sm py-2 border-b last:border-0">
                <span className="text-gray-400 shrink-0 w-32">{new Date(i.date).toLocaleDateString('fr-FR')}</span>
                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${STATUT_COLORS[i.type_action] || 'bg-gray-100'}`}>
                  {STATUT_LABELS[i.type_action] || i.type_action}
                </span>
                <span className="text-gray-600">{i.notes}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune interaction enregistrée</p>
        )}
      </div>
    </div>
  );
}
