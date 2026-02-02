export interface Avatar {
  id: number;
  nom: string;
  description: string;
  secteurs: string;
  taille_entreprise: string;
  douleurs: string; // JSON string of string[]
  mots_cles_linkedin: string;
  created_at: string;
}

export interface Prospect {
  id: number;
  avatar_id: number | null;
  prenom: string;
  nom: string;
  entreprise: string;
  poste: string;
  url_linkedin: string;
  statut: string;
  notes: string;
  date_connexion: string | null;
  created_at: string;
  updated_at: string;
  avatar_nom?: string;
  avatar_douleurs?: string;
  interactions?: Interaction[];
}

export interface Interaction {
  id: number;
  prospect_id: number;
  date: string;
  type_action: string;
  notes: string;
}

export interface Template {
  id: number;
  nom: string;
  type: string;
  contenu: string;
  created_at: string;
}

export const STATUT_LABELS: Record<string, string> = {
  demande_envoyee: 'Demande envoyée',
  connecte: 'Connecté',
  dm_remerciement: 'DM remerciement envoyé',
  message_j3: 'Message J+3 envoyé',
  en_discussion: 'En discussion',
  qualifie_chaud: 'Qualifié chaud',
  qualifie_tiede: 'Qualifié tiède',
  qualifie_froid: 'Qualifié froid',
  visio_decouverte_programmee: 'Visio découverte programmée',
  visio_decouverte_faite: 'Visio découverte faite',
  visio_closing_programmee: 'Visio closing programmée',
  close_gagne: 'Closé (gagné)',
  perdu: 'Perdu',
  pas_interesse: 'Pas intéressé',
};

export const STATUT_COLORS: Record<string, string> = {
  demande_envoyee: 'bg-slate-500/20 text-slate-200 border border-slate-500/30',
  connecte: 'bg-sky-500/20 text-sky-200 border border-sky-500/30',
  dm_remerciement: 'bg-sky-400/20 text-sky-100 border border-sky-400/30',
  message_j3: 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30',
  en_discussion: 'bg-purple-500/20 text-purple-200 border border-purple-500/30',
  qualifie_chaud: 'bg-rose-500/20 text-rose-200 border border-rose-500/30',
  qualifie_tiede: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
  qualifie_froid: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30',
  visio_decouverte_programmee: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30',
  visio_decouverte_faite: 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/30',
  visio_closing_programmee: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30',
  close_gagne: 'bg-green-500/20 text-green-200 border border-green-500/30',
  perdu: 'bg-red-500/20 text-red-200 border border-red-500/30',
  pas_interesse: 'bg-slate-600/20 text-slate-300 border border-slate-600/30',
};

export const TEMPLATE_TYPES: Record<string, string> = {
  remerciement: 'Remerciement (J+0)',
  j3: 'Engagement (J+3)',
  relance: 'Relance',
  invitation_decouverte: 'Invitation visio découverte',
  invitation_closing: 'Invitation visio closing',
};

export const PIPELINE_ORDER = [
  'demande_envoyee', 'connecte', 'dm_remerciement', 'message_j3',
  'en_discussion', 'qualifie_chaud', 'qualifie_tiede', 'qualifie_froid',
  'visio_decouverte_programmee', 'visio_decouverte_faite',
  'visio_closing_programmee', 'close_gagne', 'perdu', 'pas_interesse',
];
