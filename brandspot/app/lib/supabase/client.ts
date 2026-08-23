import { createBrowserClient } from "@supabase/ssr";

/** Browser client. Carries the publishable key only — RLS does the guarding. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
