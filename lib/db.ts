import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

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

function initializeSchema(db: Database.Database) {
  // Check if migrants table exists
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrants'")
    .get();

  if (!tableExists) {
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        db.exec(statement);
      }
    }
  }
}

const db =
  global.__sqliteDb ??
  new Database(getDatabasePath());

if (process.env.NODE_ENV !== 'production') {
  global.__sqliteDb = db;
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema if tables don't exist
initializeSchema(db);

export default db;
