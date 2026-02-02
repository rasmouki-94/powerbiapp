import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

// Find server root: walk up from this file until we find package.json with "prospecting-server"
function findServerRoot(): string {
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.name === 'prospecting-server') return dir;
      } catch {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: assume cwd is project root
  return path.join(process.cwd(), 'server');
}

const SERVER_ROOT = findServerRoot();
const DB_PATH = path.join(SERVER_ROOT, 'data', 'prospecting.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Wrapper that mimics better-sqlite3 API on top of sql.js
// so that all route files work without changes.
class DatabaseWrapper {
  private sqldb!: SqlJsDatabase;
  async init() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      this.sqldb = new SQL.Database(buffer);
    } else {
      this.sqldb = new SQL.Database();
    }
    this.sqldb.run('PRAGMA foreign_keys = ON');
  }

  private save() {
    const data = this.sqldb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  exec(sql: string) {
    // Use sqldb.exec() (not .run()) to support multiple statements
    this.sqldb.exec(sql);
    this.save();
  }

  prepare(sql: string) {
    const self = this;
    return {
      all(...params: any[]): any[] {
        const stmt = self.sqldb.prepare(sql);
        if (params.length) stmt.bind(params);
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params: any[]): any {
        const stmt = self.sqldb.prepare(sql);
        if (params.length) stmt.bind(params);
        let row: any = undefined;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row;
      },
      run(...params: any[]): { lastInsertRowid: number; changes: number } {
        self.sqldb.run(sql, params);
        const lastId = self.sqldb.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number || 0;
        const changes = self.sqldb.getRowsModified();
        self.save();
        return { lastInsertRowid: lastId, changes };
      },
    };
  }

  transaction<T>(fn: () => T): () => T {
    return () => {
      this.sqldb.run('BEGIN');
      try {
        const result = fn();
        this.sqldb.run('COMMIT');
        this.save();
        return result;
      } catch (e) {
        this.sqldb.run('ROLLBACK');
        throw e;
      }
    };
  }
}

const db = new DatabaseWrapper();

export async function initDatabase() {
  await db.init();
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
