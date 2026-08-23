import { redirect } from "next/navigation";
import { getAdmin } from "../../lib/supabase/server";
import AdminShell from "../shell";

/**
 * Everything in this route group requires a signed-in admin. The middleware
 * already blocks anonymous requests; this is the second gate that checks the
 * is_admin flag, so a signed-in shopper cannot reach the dashboard.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return <AdminShell email={admin.profile.email ?? ""}>{children}</AdminShell>;
}
