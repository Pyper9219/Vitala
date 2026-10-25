// Deprecated: Supabase client removed.
// This project now uses Neon (pg) via src/lib/db.ts.
// Kept as a re-export shim so any lingering imports do not crash at build time.
export { query } from "@/lib/db";

export const supabase = null as any;
export const supabaseAdmin = null as any;

export function createBrowserClient() {
  return null as any;
}
