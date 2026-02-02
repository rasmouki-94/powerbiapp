import { Router } from 'express';
import db from '../database';

const router = Router();

router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM templates';
  const params: any[] = [];
  if (type) { sql += ' WHERE type = ?'; params.push(type); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template non trouvé' });
  res.json(template);
});

router.post('/', (req, res) => {
  const { nom, type, contenu } = req.body;
  const result = db.prepare(
    'INSERT INTO templates (nom, type, contenu) VALUES (?, ?, ?)'
  ).run(nom, type, contenu || '');
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nom, type, contenu } = req.body;
  db.prepare('UPDATE templates SET nom=?, type=?, contenu=? WHERE id=?').run(nom, type, contenu || '', req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
