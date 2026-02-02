import { Router } from 'express';
import db from '../database';

const router = Router();

router.get('/:prospectId', (req, res) => {
  const interactions = db.prepare(
    'SELECT * FROM interactions WHERE prospect_id = ? ORDER BY date DESC'
  ).all(req.params.prospectId);
  res.json(interactions);
});

router.post('/:prospectId', (req, res) => {
  const { type_action, notes, date } = req.body;
  const result = db.prepare(
    'INSERT INTO interactions (prospect_id, type_action, notes, date) VALUES (?, ?, ?, ?)'
  ).run(req.params.prospectId, type_action, notes || '', date || new Date().toISOString());
  res.json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM interactions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
