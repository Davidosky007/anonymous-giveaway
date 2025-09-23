import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'giveaway.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS giveaways (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    winner_id TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    giveaway_id TEXT NOT NULL,
    anonymous_id TEXT NOT NULL,
    ip_hash TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

// Prepared statements
export const dbQueries = {
  // Giveaways
  createGiveaway: db.prepare(`
    INSERT INTO giveaways (id, title, description) VALUES (?, ?, ?)
  `),
  
  getAllGiveaways: db.prepare(`
    SELECT *, 
    (SELECT COUNT(*) FROM entries WHERE giveaway_id = giveaways.id) as entry_count
    FROM giveaways ORDER BY created_at DESC
  `),
  
  getActiveGiveaways: db.prepare(`
    SELECT *, 
    (SELECT COUNT(*) FROM entries WHERE giveaway_id = giveaways.id) as entry_count
    FROM giveaways WHERE status = 'active' ORDER BY created_at DESC
  `),
  
  getGiveawayById: db.prepare(`
    SELECT *, 
    (SELECT COUNT(*) FROM entries WHERE giveaway_id = giveaways.id) as entry_count
    FROM giveaways WHERE id = ?
  `),
  
  updateGiveawayWinner: db.prepare(`
    UPDATE giveaways SET winner_id = ?, status = 'completed', updated_at = strftime('%s', 'now') WHERE id = ?
  `),
  
  // Entries
  createEntry: db.prepare(`
    INSERT INTO entries (id, giveaway_id, anonymous_id, ip_hash) VALUES (?, ?, ?, ?)
  `),
  
  getEntriesByGiveaway: db.prepare(`
    SELECT * FROM entries WHERE giveaway_id = ? ORDER BY created_at ASC
  `),
  
  checkIPEntry: db.prepare(`
    SELECT COUNT(*) as count FROM entries WHERE giveaway_id = ? AND ip_hash = ?
  `),
  
  // Sessions
  createSession: db.prepare(`
    INSERT OR REPLACE INTO admin_sessions (id, expires_at) VALUES (?, ?)
  `),
  
  getSession: db.prepare(`
    SELECT * FROM admin_sessions WHERE id = ? AND expires_at > strftime('%s', 'now')
  `),
  
  deleteSession: db.prepare(`
    DELETE FROM admin_sessions WHERE id = ?
  `)
};

export default db;
