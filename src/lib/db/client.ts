import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";

export interface Queryable {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface Database extends Queryable {
  kind: "postgres" | "pglite";
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export class DatabaseConfigError extends Error {}

/**
 * Selección del motor:
 * - DATABASE_URL definida → PostgreSQL (Supabase, Neon, RDS, servidor propio…) mediante `pg`.
 * - Sin DATABASE_URL → PGlite: PostgreSQL embebido que guarda los datos en `.data/pglite`.
 *   Pensado para desarrollo local. En producción se exige DATABASE_URL salvo que se active
 *   ALLOW_EMBEDDED_DB=true de forma explícita (servidor propio con disco persistente).
 */
async function createDatabase(): Promise<Database> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return createPostgres(url);

  // En Vercel solo /tmp es escribible (y efímero): sirve para una demo, no para datos reales.
  const defaultDir = process.env.VERCEL ? "/tmp/pglite" : path.join(process.cwd(), ".data", "pglite");
  const dataDir = process.env.PGLITE_DATA_DIR?.trim() || defaultDir;
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_EMBEDDED_DB !== "true" && !dataDir.startsWith("memory://")) {
    throw new DatabaseConfigError(
      "DATABASE_URL no está configurada. En producción define DATABASE_URL (PostgreSQL) o ALLOW_EMBEDDED_DB=true si el servidor tiene disco persistente.",
    );
  }
  return createPglite(dataDir);
}

async function createPostgres(connectionString: string): Promise<Database> {
  const { Pool } = await import("pg");
  const sslMode = process.env.DATABASE_SSL ?? "require";
  const ssl =
    sslMode === "disable"
      ? false
      : sslMode === "no-verify"
        ? { rejectUnauthorized: false }
        : { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n") || undefined };

  const pool = new Pool({
    connectionString,
    ssl,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  return {
    kind: "postgres",
    query: async (sql, params) => {
      const res = await pool.query(sql, params as unknown[]);
      return { rows: res.rows };
    },
    transaction: async (fn) => {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await fn({
          query: async (sql, params) => ({ rows: (await client.query(sql, params as unknown[])).rows }),
        });
        await client.query("commit");
        return result;
      } catch (err) {
        await client.query("rollback").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

async function createPglite(dataDir: string): Promise<Database> {
  const { PGlite } = await import("@electric-sql/pglite");
  const inMemory = dataDir.startsWith("memory://");
  if (!inMemory) mkdirSync(dataDir, { recursive: true });
  const db = inMemory ? await PGlite.create() : await PGlite.create(dataDir);
  return {
    kind: "pglite",
    query: async (sql, params) => {
      const res = await db.query(sql, params as unknown[]);
      return { rows: res.rows as never[] };
    },
    transaction: (fn) =>
      db.transaction((tx) =>
        fn({
          query: async (sql, params) => ({ rows: (await tx.query(sql, params as unknown[])).rows as never[] }),
        }),
      ),
    close: () => db.close(),
  };
}

const globalForDb = globalThis as unknown as { __manaDb?: Promise<Database> };

/** Conexión única por proceso (sobrevive a las recargas en caliente de desarrollo). */
export function getDb(): Promise<Database> {
  if (!globalForDb.__manaDb) {
    globalForDb.__manaDb = (async () => {
      const db = await createDatabase();
      await applySchema(db);
      return db;
    })().catch((err) => {
      globalForDb.__manaDb = undefined;
      throw err;
    });
  }
  return globalForDb.__manaDb;
}

export async function applySchema(db: Queryable & { kind?: string }): Promise<void> {
  if (db.kind === "pglite") {
    // PGlite admite varias sentencias en exec(); con parámetros vacíos query() solo acepta una.
    for (const statement of splitStatements(SCHEMA_SQL)) await db.query(statement);
  } else {
    await db.query(SCHEMA_SQL);
  }
}

function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Solo para pruebas: inyecta una base de datos concreta. */
export function __setTestDb(db: Database | undefined) {
  globalForDb.__manaDb = db ? Promise.resolve(db) : undefined;
}
