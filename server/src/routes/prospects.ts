import { Router } from 'express';
import db from '../database';
import multer from 'multer';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: '/tmp/uploads/' });

const STATUTS = [
  'demande_envoyee', 'connecte', 'dm_remerciement', 'message_j3',
  'en_discussion', 'qualifie_chaud', 'qualifie_tiede', 'qualifie_froid',
  'visio_decouverte_programmee', 'visio_decouverte_faite',
  'visio_closing_programmee', 'close_gagne', 'perdu', 'pas_interesse'
];

router.get('/', (req, res) => {
  const { statut, avatar_id } = req.query;
  let sql = `SELECT p.*, a.nom as avatar_nom FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id`;
  const conditions: string[] = [];
  const params: any[] = [];

  if (statut) { conditions.push('p.statut = ?'); params.push(statut); }
  if (avatar_id) { conditions.push('p.avatar_id = ?'); params.push(avatar_id); }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY p.updated_at DESC';

  res.json(db.prepare(sql).all(...params));
});

router.get('/stats', (_req, res) => {
  // Counts by status
  const countsByStatus = db.prepare(
    'SELECT statut, COUNT(*) as count FROM prospects GROUP BY statut'
  ).all() as { statut: string; count: number }[];

  // Counts by avatar and status
  const countsByAvatar = db.prepare(
    `SELECT a.nom as avatar_nom, p.statut, COUNT(*) as count
     FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id
     GROUP BY p.avatar_id, p.statut`
  ).all();

  // Weekly stats (last 12 weeks)
  const weeklyStats = db.prepare(
    `SELECT strftime('%Y-%W', created_at) as week, statut, COUNT(*) as count
     FROM prospects
     WHERE created_at >= date('now', '-84 days')
     GROUP BY week, statut
     ORDER BY week`
  ).all();

  // Average time in each status (days between interactions)
  const avgTimeInStatus = db.prepare(
    `SELECT i1.type_action as from_status,
            AVG(julianday(i2.date) - julianday(i1.date)) as avg_days
     FROM interactions i1
     JOIN interactions i2 ON i1.prospect_id = i2.prospect_id AND i2.id > i1.id
     WHERE i2.id = (SELECT MIN(id) FROM interactions WHERE prospect_id = i1.prospect_id AND id > i1.id)
     GROUP BY i1.type_action`
  ).all();

  res.json({ countsByStatus, countsByAvatar, weeklyStats, avgTimeInStatus });
});

router.get('/actions-du-jour', (_req, res) => {
  // Prospects connected today -> send thank you DM
  const dmRemerciement = db.prepare(
    `SELECT p.*, a.nom as avatar_nom, a.douleurs as avatar_douleurs
     FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id
     WHERE p.statut = 'connecte' AND date(p.date_connexion) = date('now')`
  ).all();

  // Prospects connected 3 days ago -> send J+3 message
  const messageJ3 = db.prepare(
    `SELECT p.*, a.nom as avatar_nom, a.douleurs as avatar_douleurs
     FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id
     WHERE p.statut = 'dm_remerciement' AND date(p.date_connexion) <= date('now', '-3 days')`
  ).all();

  // Overdue follow-ups: in discussion with no interaction for 5+ days
  const relances = db.prepare(
    `SELECT p.*, a.nom as avatar_nom, a.douleurs as avatar_douleurs,
            (SELECT MAX(date) FROM interactions WHERE prospect_id = p.id) as derniere_interaction
     FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id
     WHERE p.statut IN ('en_discussion', 'message_j3')
     AND (SELECT MAX(date) FROM interactions WHERE prospect_id = p.id) <= datetime('now', '-5 days')`
  ).all();

  res.json({ dmRemerciement, messageJ3, relances });
});

router.get('/:id', (req, res) => {
  const prospect = db.prepare(
    `SELECT p.*, a.nom as avatar_nom, a.douleurs as avatar_douleurs
     FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id WHERE p.id = ?`
  ).get(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect non trouvé' });

  const interactions = db.prepare(
    'SELECT * FROM interactions WHERE prospect_id = ? ORDER BY date DESC'
  ).all(req.params.id);

  res.json({ ...prospect as any, interactions });
});

router.post('/', (req, res) => {
  const { avatar_id, prenom, nom, entreprise, poste, url_linkedin, statut, notes, date_connexion } = req.body;
  const result = db.prepare(
    `INSERT INTO prospects (avatar_id, prenom, nom, entreprise, poste, url_linkedin, statut, notes, date_connexion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(avatar_id || null, prenom, nom, entreprise || '', poste || '', url_linkedin || '',
        statut || 'demande_envoyee', notes || '', date_connexion || null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { avatar_id, prenom, nom, entreprise, poste, url_linkedin, statut, notes, date_connexion } = req.body;
  db.prepare(
    `UPDATE prospects SET avatar_id=?, prenom=?, nom=?, entreprise=?, poste=?, url_linkedin=?,
     statut=?, notes=?, date_connexion=?, updated_at=datetime('now') WHERE id=?`
  ).run(avatar_id || null, prenom, nom, entreprise || '', poste || '', url_linkedin || '',
        statut, notes || '', date_connexion || null, req.params.id);
  res.json({ success: true });
});

router.patch('/:id/statut', (req, res) => {
  const { statut, notes } = req.body;
  if (!STATUTS.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });

  const updateData: any = { statut };
  // Auto-set date_connexion when moving to 'connecte'
  if (statut === 'connecte') {
    db.prepare(
      `UPDATE prospects SET statut=?, date_connexion=COALESCE(date_connexion, datetime('now')), updated_at=datetime('now') WHERE id=?`
    ).run(statut, req.params.id);
  } else {
    db.prepare(
      `UPDATE prospects SET statut=?, updated_at=datetime('now') WHERE id=?`
    ).run(statut, req.params.id);
  }

  // Log interaction
  db.prepare(
    'INSERT INTO interactions (prospect_id, type_action, notes) VALUES (?, ?, ?)'
  ).run(req.params.id, statut, notes || '');

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM prospects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// CSV import
router.post('/import-csv', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier manquant' });

  const content = fs.readFileSync(req.file.path, 'utf-8');
  fs.unlinkSync(req.file.path);

  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return res.status(400).json({ error: 'Fichier CSV vide' });

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const insert = db.prepare(
    `INSERT INTO prospects (avatar_id, prenom, nom, entreprise, poste, url_linkedin, statut, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let imported = 0;
  const insertMany = db.transaction(() => {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      insert.run(
        row.avatar_id ? parseInt(row.avatar_id) : null,
        row.prenom || '', row.nom || '', row.entreprise || '',
        row.poste || '', row.url_linkedin || '',
        row.statut || 'demande_envoyee', row.notes || ''
      );
      imported++;
    }
  });

  insertMany();
  res.json({ imported });
});

// CSV export
router.get('/export/csv', (_req, res) => {
  const prospects = db.prepare(
    `SELECT p.*, a.nom as avatar_nom FROM prospects p LEFT JOIN avatars a ON p.avatar_id = a.id ORDER BY p.created_at`
  ).all() as any[];

  const headers = ['id', 'prenom', 'nom', 'entreprise', 'poste', 'url_linkedin', 'statut', 'avatar_nom', 'notes', 'date_connexion', 'created_at'];
  const csv = [
    headers.join(','),
    ...prospects.map(p => headers.map(h => `"${(p[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=prospects.csv');
  res.send(csv);
});

export default router;
