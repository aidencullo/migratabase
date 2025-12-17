import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

type ExecuteResult = [unknown, unknown];

type SqlJsDatabase = import('sql.js').Database;
type SqlJsModule = import('sql.js').SqlJsStatic;
type BindParams = import('sql.js').BindParams;

declare global {
  // eslint-disable-next-line no-var
  var __migradb: SqlJsDatabase | undefined;
  // eslint-disable-next-line no-var
  var __migradbInitialized: boolean | undefined;
  // eslint-disable-next-line no-var
  var __sqljs: Promise<SqlJsModule> | undefined;
}

function getSchemaSql(): string {
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  return fs.readFileSync(schemaPath, 'utf-8');
}

function locateSqlJsFile(file: string): string {
  // sql.js loads its wasm file at runtime; point it at node_modules.
  return path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
}

async function getSqlJs(): Promise<SqlJsModule> {
  if (!globalThis.__sqljs) {
    globalThis.__sqljs = initSqlJs({ locateFile: locateSqlJsFile });
  }
  return globalThis.__sqljs;
}

async function getDb(): Promise<SqlJsDatabase> {
  if (!globalThis.__migradb) {
    const SQL = await getSqlJs();
    globalThis.__migradb = new SQL.Database();
  }
  return globalThis.__migradb;
}

export async function ensureSchema(): Promise<void> {
  if (globalThis.__migradbInitialized) return;
  const db = await getDb();
  db.exec(getSchemaSql());
  globalThis.__migradbInitialized = true;
}

function isQueryStatement(sql: string): boolean {
  const s = sql.trim().toLowerCase();
  return s.startsWith('select') || s.startsWith('with') || s.startsWith('pragma');
}

function rowsFromExecResult(result: ReturnType<SqlJsDatabase['exec']>): Record<string, unknown>[] {
  if (!result || result.length === 0) return [];
  const first = result[0];
  const { columns, values } = first;
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < columns.length; i++) obj[columns[i]] = row[i];
    return obj;
  });
}

async function getScalarNumber(db: SqlJsDatabase, sql: string): Promise<number> {
  const rows = rowsFromExecResult(db.exec(sql));
  const first = rows[0];
  if (!first) return 0;
  const value = Object.values(first)[0];
  return Number(value ?? 0);
}

const db = {
  /**
   * MySQL2-compat-ish helper used by existing API routes.
   * - SELECT returns: [rowsArray, undefined]
   * - INSERT/UPDATE/DELETE returns: [{ insertId, changes }, undefined]
   */
  async execute(sql: string, params: unknown[] = []): Promise<ExecuteResult> {
    await ensureSchema();
    const database = await getDb();

    if (isQueryStatement(sql)) {
      const rows = rowsFromExecResult(database.exec(sql, params as BindParams));
      return [rows, undefined];
    }

    database.run(sql, params as BindParams);
    const insertId = await getScalarNumber(database, 'SELECT last_insert_rowid() as insertId');
    const changes = await getScalarNumber(database, 'SELECT changes() as changes');
    return [{ insertId, changes }, undefined];
  },

  async exec(sql: string): Promise<void> {
    await ensureSchema();
    (await getDb()).exec(sql);
  },
};

export default db;
