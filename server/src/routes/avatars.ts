import { Router } from 'express';
import db from '../database';

const router = Router();

router.get('/', (_req, res) => {
  const avatars = db.prepare('SELECT * FROM avatars ORDER BY created_at DESC').all();
  res.json(avatars);
});

router.get('/:id', (req, res) => {
  const avatar = db.prepare('SELECT * FROM avatars WHERE id = ?').get(req.params.id);
  if (!avatar) return res.status(404).json({ error: 'Avatar non trouvé' });
  res.json(avatar);
});

router.post('/', (req, res) => {
  const { nom, description, secteurs, taille_entreprise, douleurs, mots_cles_linkedin } = req.body;
  const result = db.prepare(
    'INSERT INTO avatars (nom, description, secteurs, taille_entreprise, douleurs, mots_cles_linkedin) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(nom, description || '', secteurs || '', taille_entreprise || '', JSON.stringify(douleurs || []), mots_cles_linkedin || '');
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nom, description, secteurs, taille_entreprise, douleurs, mots_cles_linkedin } = req.body;
  db.prepare(
    'UPDATE avatars SET nom=?, description=?, secteurs=?, taille_entreprise=?, douleurs=?, mots_cles_linkedin=? WHERE id=?'
  ).run(nom, description || '', secteurs || '', taille_entreprise || '', JSON.stringify(douleurs || []), mots_cles_linkedin || '', req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM avatars WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
