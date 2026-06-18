import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

type DrizzleDb = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      '[DB] DATABASE_URL is not set. ' +
      'Add it to your .env.local file. ' +
      'See .env.example for the required format.'
    );
  }
  const sql = neon(url);
  return drizzle(sql);
}

/**
 * Lazily initialize the DB connection so that importing this module
 * at Next.js build-time (which runs without runtime env vars) does NOT
 * crash. The connection is only created on the first actual query.
 */
let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop: string | symbol) {
    const instance = getDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
