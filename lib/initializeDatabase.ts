import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

declare global {
  // eslint-disable-next-line no-var
  var __migratabaseInitialized: boolean | undefined;
}

export async function initializeDatabase() {
  if (global.__migratabaseInitialized) return;

  // Enable foreign keys for this connection.
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');

  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // SQLite driver does not allow multi-statement execution.
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  global.__migratabaseInitialized = true;
}

