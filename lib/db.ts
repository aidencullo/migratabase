import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    // Reasonable local default for dev if DATABASE_URL isn't set
    'postgres://postgres:postgres@localhost:5432/migratabase'
  );
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

export default pool;
