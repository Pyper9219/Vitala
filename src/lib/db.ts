import { neon, neonConfig } from '@neondatabase/serverless';

// Use Neon directly (Edge-compatible); no pg Pool needed in client bundles.
// Do not hardcode fetchEndpoint — Neon derives it from DATABASE_URL's host.
// A generic sql.neon.tech endpoint fails against project-specific Neon hosts.
// Create the sql client lazily so routes that don't touch the database
// don't crash at module load if DATABASE_URL isn't available yet.
let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not defined. Set it to your Neon connection string ' +
        '(postgresql://user:password@host/db?sslmode=require) in .env.local or your deployment env.'
      );
    }
    sql = neon(DATABASE_URL);
  }
  return sql;
}

// Helper: run a SQL query with parameterized $1, $2, etc. placeholders.
// neon() is a tagged-template API in @neondatabase/serverless v1.x; use
// sql.query(text, params) instead of calling sql(...) as a function.
export async function query<T = any>(text: string, params: unknown[] = []): Promise<{ rows: T[]; rowCount: number }> {
  const rows = (await getSql().query(text, params)) as unknown as T[];
  return { rows, rowCount: rows.length };
}

export async function getClient() {
  return getSql();
}