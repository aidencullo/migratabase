import Database from 'better-sqlite3';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __sqliteDb: Database.Database | undefined;
}

function getDatabasePath() {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  return path.join(process.cwd(), 'migratabase.db');
}

const db =
  global.__sqliteDb ??
  new Database(getDatabasePath());

if (process.env.NODE_ENV !== 'production') {
  global.__sqliteDb = db;
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;
