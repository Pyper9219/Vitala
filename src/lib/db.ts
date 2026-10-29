import { neon, neonConfig } from "@neondatabase/serverless";

// Use Neon directly (Edge-compatible); no pg Pool needed in client bundles.
// Neon's default fetchEndpoint derivation (ep-xxx.region.aws.neon.tech ->
// ep-xxx.region.aws.api.neon.tech/sql) produces unreachable hosts for pooled
// connections. Derive the regional API endpoint instead:
//   ep-withered-base-b5xslse5-pooler.c-7.us-east-2.aws.neon.tech
//     -> https://api.c-7.us-east-2.aws.neon.tech/sql
// Create the sql client lazily so routes that don't touch the database
// don't crash at module load if DATABASE_URL isn't available yet.
let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not defined. Set it to your Neon connection string " +
          "(postgresql://user:password@host/db?sslmode=require) in .env.local or your deployment env.",
      );
    }
    const dbHost = new URL(DATABASE_URL.replace("postgresql://", "https://")).hostname;
    const regionSuffix = dbHost.replace(/^[^.]+\./, "");
    neonConfig.fetchEndpoint = `https://api.${regionSuffix}/sql`;
    sql = neon(DATABASE_URL);
  }
  return sql;
}

// Maximum time (ms) to wait for a Neon query before failing with a clear
// error instead of hanging the request indefinitely (e.g. sign-in stuck on
// "Signing in…").
const QUERY_TIMEOUT_MS = 8_000;

// Helper: run a SQL query with parameterized $1, $2, etc. placeholders.
// neon() is a tagged-template API in @neondatabase/serverless v1.x; use
// sql.query(text, params) instead of calling sql(...) as a function.
// Uses AbortController so a timeout actually cancels the underlying Neon
// fetch instead of leaving it running in the background.
export async function query<T = any>(
  text: string,
  params: unknown[] = [],
): Promise<{ rows: T[]; rowCount: number }> {
  const controller = new AbortController();
  // Route the abort signal through fetchOptions so the underlying Neon fetch
  // is actually cancelled on timeout (HTTPQueryOptions has no top-level
  // 'signal' property in @neondatabase/serverless v1.x).
  const promise = getSql().query(text, params, {
    fetchOptions: { signal: controller.signal },
  }) as Promise<unknown[]>;
  let timer: NodeJS.Timeout | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Database query timed out after ${QUERY_TIMEOUT_MS}ms`));
    }, QUERY_TIMEOUT_MS);
  });
  try {
    const rows = (await Promise.race([promise, timeout])) as unknown as T[];
    return { rows, rowCount: rows.length };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getClient() {
  return getSql();
}
