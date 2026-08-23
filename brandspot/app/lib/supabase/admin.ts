import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS entirely, so it must never be imported
 * into a client component — server actions and route handlers only.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
