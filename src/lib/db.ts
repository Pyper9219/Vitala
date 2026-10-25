import { neon, neonConfig } from '@neondatabase/serverless';

// Configure fetch endpoint before creating the sql client
neonConfig.fetchEndpoint = 'https://sql.neon.tech';

// Use Neon directly (Edge-compatible); no pg Pool needed in client bundles.
const sql = neon(process.env.DATABASE_URL!);

// Helper: run a SQL query with parameterized $1, $2, etc. placeholders
// neon() returns { rows, rowCount } directly from a tagged-template call.
// We convert (text, params) into a tagged-template call by splitting on $N placeholders.
export async function query<T = any>(text: string, params: unknown[] = []): Promise<{ rows: T[]; rowCount: number }> {
  // Split the SQL text on $1, $2, etc. placeholders to create template parts
  const parts = text.split(/\$\d+/) as any;
  const result = (await sql(parts, ...params)) as unknown as { rows: T[]; rowCount: number };
  return result;
}

export async function getClient() {
  return sql;
}