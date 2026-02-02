const BASE = '/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Avatars
  getAvatars: () => request('/avatars'),
  getAvatar: (id: number) => request(`/avatars/${id}`),
  createAvatar: (data: any) => request('/avatars', { method: 'POST', body: JSON.stringify(data) }),
  updateAvatar: (id: number, data: any) => request(`/avatars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAvatar: (id: number) => request(`/avatars/${id}`, { method: 'DELETE' }),

  // Prospects
  getProspects: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/prospects${qs}`);
  },
  getProspect: (id: number) => request(`/prospects/${id}`),
  createProspect: (data: any) => request('/prospects', { method: 'POST', body: JSON.stringify(data) }),
  updateProspect: (id: number, data: any) => request(`/prospects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatut: (id: number, statut: string, notes?: string) =>
    request(`/prospects/${id}/statut`, { method: 'PATCH', body: JSON.stringify({ statut, notes }) }),
  deleteProspect: (id: number) => request(`/prospects/${id}`, { method: 'DELETE' }),
  getStats: () => request('/prospects/stats'),
  getActionsDuJour: () => request('/prospects/actions-du-jour'),
  importCsv: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${BASE}/prospects/import-csv`, { method: 'POST', body: fd }).then(r => r.json());
  },

  // Templates
  getTemplates: (type?: string) => request(`/templates${type ? `?type=${type}` : ''}`),
  getTemplate: (id: number) => request(`/templates/${id}`),
  createTemplate: (data: any) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: number, data: any) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: number) => request(`/templates/${id}`, { method: 'DELETE' }),

  // Interactions
  getInteractions: (prospectId: number) => request(`/interactions/${prospectId}`),
  createInteraction: (prospectId: number, data: any) =>
    request(`/interactions/${prospectId}`, { method: 'POST', body: JSON.stringify(data) }),
};
