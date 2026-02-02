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
  demande_envoyee: 'bg-gray-100 text-gray-800',
  connecte: 'bg-blue-100 text-blue-800',
  dm_remerciement: 'bg-blue-200 text-blue-900',
  message_j3: 'bg-indigo-100 text-indigo-800',
  en_discussion: 'bg-purple-100 text-purple-800',
  qualifie_chaud: 'bg-red-100 text-red-800',
  qualifie_tiede: 'bg-orange-100 text-orange-800',
  qualifie_froid: 'bg-cyan-100 text-cyan-800',
  visio_decouverte_programmee: 'bg-yellow-100 text-yellow-800',
  visio_decouverte_faite: 'bg-yellow-200 text-yellow-900',
  visio_closing_programmee: 'bg-emerald-100 text-emerald-800',
  close_gagne: 'bg-green-100 text-green-800',
  perdu: 'bg-red-200 text-red-900',
  pas_interesse: 'bg-gray-200 text-gray-600',
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
