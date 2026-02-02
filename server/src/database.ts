import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'prospecting.db');

// Ensure data directory exists
import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS avatars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      description TEXT DEFAULT '',
      secteurs TEXT DEFAULT '',
      taille_entreprise TEXT DEFAULT '',
      douleurs TEXT DEFAULT '[]',
      mots_cles_linkedin TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
      prenom TEXT NOT NULL,
      nom TEXT NOT NULL,
      entreprise TEXT DEFAULT '',
      poste TEXT DEFAULT '',
      url_linkedin TEXT DEFAULT '',
      statut TEXT NOT NULL DEFAULT 'demande_envoyee',
      notes TEXT DEFAULT '',
      date_connexion TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
      date TEXT DEFAULT (datetime('now')),
      type_action TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      type TEXT NOT NULL,
      contenu TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export default db;
