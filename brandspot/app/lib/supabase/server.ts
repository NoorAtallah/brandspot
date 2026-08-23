import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server client bound to the request cookies, so it sees the signed-in user. */
export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The middleware refreshes the session instead, so this is safe.
          }
        },
      },
    }
  );
}

/** The signed-in user plus their admin flag. Null when signed out. */
export async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? { user, profile } : null;
}
