import { neon, neonConfig } from '@neondatabase/serverless';

// Configure fetch endpoint before creating the sql client
neonConfig.fetchEndpoint = 'https://sql.neon.tech';

// Use Neon directly (Edge-compatible); no pg Pool needed in client bundles.
const sql = neon(process.env.DATABASE_URL!);

// Helper: run a SQL query with parameterized $1, $2, etc. placeholders.
// neon() is a tagged-template API in @neondatabase/serverless v1.x; use
// sql.query(text, params) instead of calling sql(...) as a function.
export async function query<T = any>(text: string, params: unknown[] = []): Promise<{ rows: T[]; rowCount: number }> {
  const rows = (await sql.query(text, params)) as unknown as T[];
  return { rows, rowCount: rows.length };
}

export async function getClient() {
  return sql;
}