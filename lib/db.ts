import { Database } from 'bun:sqlite';

declare global {
  // eslint-disable-next-line no-var
  var __sqliteDb: Database | undefined;
}

function getDatabasePath() {
  return process.env.DATABASE_PATH || './migratabase.db';
}

const db =
  global.__sqliteDb ??
  new Database(getDatabasePath());

if (process.env.NODE_ENV !== 'production') {
  global.__sqliteDb = db;
}

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

export default db;
