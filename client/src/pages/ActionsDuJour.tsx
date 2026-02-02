import { useEffect, useState } from 'react';
import { api } from '../api';
import { Prospect, Template, STATUT_LABELS } from '../types';
import { Check, Copy, ExternalLink } from 'lucide-react';

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

interface ActionCardProps {
  prospect: Prospect;
  actionType: string;
  nextStatut: string;
  templates: Template[];
  onDone: () => void;
}

function ActionCard({ prospect, actionType, nextStatut, templates, onDone }: ActionCardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(templates[0] || null);

  const message = selectedTemplate ? replaceVariables(selectedTemplate.contenu, prospect) : '';

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markDone = async () => {
    await api.updateStatut(prospect.id, nextStatut, `Action: ${actionType}`);
    onDone();
  };

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{prospect.prenom} {prospect.nom}</span>
            {prospect.url_linkedin && (
              <a href={prospect.url_linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <p className="text-sm text-gray-500">{prospect.poste} - {prospect.entreprise}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800 font-medium">
            {actionType}
          </span>
        </div>
      </div>

      {templates.length > 1 && (
        <select
          className="w-full mb-2 border rounded px-2 py-1 text-sm"
          value={selectedTemplate?.id || ''}
          onChange={e => setSelectedTemplate(templates.find(t => t.id === Number(e.target.value)) || null)}
        >
          {templates.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
        </select>
      )}

      {message && (
        <div className="bg-gray-50 rounded p-3 text-sm mb-3 whitespace-pre-wrap">{message}</div>
      )}

      <div className="flex gap-2">
        {message && (
          <button onClick={copyMessage} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Copié !' : 'Copier le message'}
          </button>
        )}
        <button onClick={markDone} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">
          <Check size={14} /> Marquer comme fait
        </button>
      </div>
    </div>
  );
}

export default function ActionsDuJour() {
  const [data, setData] = useState<{ dmRemerciement: Prospect[]; messageJ3: Prospect[]; relances: Prospect[] } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);

  const load = () => {
    api.getActionsDuJour().then(setData);
    api.getTemplates().then(setTemplates);
  };

  useEffect(() => { load(); }, []);

  if (!data) return <div className="p-8 text-gray-500">Chargement...</div>;

  const remerciementTemplates = templates.filter(t => t.type === 'remerciement');
  const j3Templates = templates.filter(t => t.type === 'j3');
  const relanceTemplates = templates.filter(t => t.type === 'relance');

  const total = data.dmRemerciement.length + data.messageJ3.length + data.relances.length;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Actions du jour</h1>
      <p className="text-gray-500 mb-6">{total} action{total > 1 ? 's' : ''} à réaliser</p>

      {total === 0 && (
        <div className="bg-green-50 text-green-700 rounded-lg p-6 text-center">
          Aucune action en attente. Tout est à jour !
        </div>
      )}

      {data.dmRemerciement.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            DM de remerciement à envoyer ({data.dmRemerciement.length})
          </h2>
          <div className="space-y-3">
            {data.dmRemerciement.map(p => (
              <ActionCard key={p.id} prospect={p} actionType="Envoyer DM remerciement"
                nextStatut="dm_remerciement" templates={remerciementTemplates} onDone={load} />
            ))}
          </div>
        </section>
      )}

      {data.messageJ3.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            Messages J+3 à envoyer ({data.messageJ3.length})
          </h2>
          <div className="space-y-3">
            {data.messageJ3.map(p => (
              <ActionCard key={p.id} prospect={p} actionType="Envoyer message J+3"
                nextStatut="message_j3" templates={j3Templates} onDone={load} />
            ))}
          </div>
        </section>
      )}

      {data.relances.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            Relances en retard ({data.relances.length})
          </h2>
          <div className="space-y-3">
            {data.relances.map(p => (
              <ActionCard key={p.id} prospect={p} actionType="Relancer"
                nextStatut="en_discussion" templates={relanceTemplates} onDone={load} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
