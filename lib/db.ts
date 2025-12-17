import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return undefined;
}

function createPoolFromEnv(): mysql.Pool {
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? '10') || 10;
  const dbSsl = parseBool(process.env.DB_SSL);

  // Prefer a single `DATABASE_URL` when provided (common in managed environments)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const databaseFromPath = url.pathname?.replace(/^\//, '');

    return mysql.createPool({
      host: url.hostname,
      port: url.port ? Number(url.port) : undefined,
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: databaseFromPath || undefined,
      waitForConnections: true,
      connectionLimit,
      queueLimit: 0,
      ssl:
        parseBool(url.searchParams.get('ssl') ?? undefined) ??
        dbSsl
          ? { rejectUnauthorized: true }
          : undefined,
    });
  }

  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'migratabase',
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    ssl: dbSsl ? { rejectUnauthorized: true } : undefined,
  });
}

const pool = globalThis.__mysqlPool ?? createPoolFromEnv();
if (process.env.NODE_ENV !== 'production') globalThis.__mysqlPool = pool;

export default pool;
