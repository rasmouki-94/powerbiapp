import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { api } from '../api';
import { Prospect, STATUT_LABELS, STATUT_COLORS, PIPELINE_ORDER } from '../types';
import { ExternalLink, GripVertical } from 'lucide-react';

// Kanban columns to display (skip terminal states from main view to keep it manageable)
const KANBAN_COLUMNS = [
  'demande_envoyee', 'connecte', 'dm_remerciement', 'message_j3',
  'en_discussion', 'qualifie_chaud', 'qualifie_tiede', 'qualifie_froid',
  'visio_decouverte_programmee', 'visio_decouverte_faite',
  'visio_closing_programmee', 'close_gagne', 'perdu', 'pas_interesse',
];

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded p-2 shadow-sm border cursor-pointer hover:shadow-md transition-shadow text-xs"
      onClick={() => navigate(`/prospects/${prospect.id}`)}
      draggable={false}
    >
      <div className="font-medium truncate">{prospect.prenom} {prospect.nom}</div>
      <div className="text-gray-500 truncate">{prospect.poste}</div>
      <div className="text-gray-400 truncate">{prospect.entreprise}</div>
    </div>
  );
}

function KanbanColumn({ statut, prospects, onDrop }: { statut: string; prospects: Prospect[]; onDrop: (id: number, statut: string) => void }) {
  return (
    <div
      className="flex-shrink-0 w-56 bg-gray-100 rounded-lg flex flex-col"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        const id = Number(e.dataTransfer.getData('prospectId'));
        if (id) onDrop(id, statut);
      }}
    >
      <div className="p-2 border-b bg-gray-200 rounded-t-lg">
        <div className="text-xs font-semibold truncate">{STATUT_LABELS[statut]}</div>
        <div className="text-xs text-gray-500">{prospects.length}</div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {prospects.map(p => (
          <div
            key={p.id}
            draggable
            onDragStart={e => e.dataTransfer.setData('prospectId', String(p.id))}
          >
            <ProspectCard prospect={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const load = () => api.getProspects().then(setProspects);
  useEffect(() => { load(); }, []);

  const handleDrop = async (id: number, newStatut: string) => {
    await api.updateStatut(id, newStatut);
    load();
  };

  const grouped = KANBAN_COLUMNS.reduce<Record<string, Prospect[]>>((acc, s) => {
    acc[s] = prospects.filter(p => p.statut === s);
    return acc;
  }, {});

  // Conversion rates
  const total = prospects.length;
  const countByStatut = (s: string) => prospects.filter(p => p.statut === s).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Pipeline de prospection</h1>
      <p className="text-gray-500 mb-4">{total} prospect{total > 1 ? 's' : ''} au total</p>

      {/* Summary counters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {KANBAN_COLUMNS.map(s => {
          const count = grouped[s]?.length || 0;
          if (count === 0) return null;
          return (
            <span key={s} className={`px-2 py-1 rounded text-xs font-medium ${STATUT_COLORS[s]}`}>
              {STATUT_LABELS[s]}: {count}
            </span>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(s => (
          <KanbanColumn key={s} statut={s} prospects={grouped[s] || []} onDrop={handleDrop} />
        ))}
      </div>
    </div>
  );
}
