import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create a client-side Supabase client from environment variables.
 * Used in client components/pages that import from @/lib/supabase.
 */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
