'use client';
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, Shirt, FolderTree, Tag, Sparkles, Receipt, LogOut, ExternalLink, type LucideIcon } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { glassLight, CAMEL, INK } from "../lib/glass";

const NAV: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "Overview", Icon: LayoutGrid },
  { href: "/admin/products", label: "Products", Icon: Shirt },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/brands", label: "Brands", Icon: Tag },
  { href: "/admin/looks", label: "Looks", Icon: Sparkles },
  { href: "/admin/orders", label: "Orders", Icon: Receipt },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col p-4 md:flex">
        <div className="flex h-full flex-col rounded-[26px] p-4" style={glassLight}>
          <Link href="/admin" className="flex items-center gap-1.5 px-2 py-1">
            <span className="text-lg font-extrabold tracking-tight" style={{ color: INK }}>brans</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAMEL }} />
            <span className="text-lg font-extrabold tracking-tight" style={{ color: CAMEL }}>spot</span>
          </Link>
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "rgba(20,20,20,0.5)" }}>
            Admin
          </p>

          <nav className="mt-5 flex flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => {
              const on = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13.5px] font-bold"
                  style={{ color: on ? INK : "rgba(20,20,20,0.7)" }}
                >
                  {on ? (
                    <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-2xl" style={{ background: CAMEL }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  ) : null}
                  <span className="relative flex items-center gap-2.5">
                    <Icon size={17} strokeWidth={2.3} />
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 pt-4">
            <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>
              <ExternalLink size={16} strokeWidth={2.3} />
              View store
            </Link>
            <button onClick={signOut} className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-start text-[13px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>
              <LogOut size={16} strokeWidth={2.3} />
              Sign out
            </button>
            <p className="truncate px-3 pt-1 text-[11px] font-bold" style={{ color: "rgba(20,20,20,0.45)" }}>{email}</p>
          </div>
        </div>
      </aside>

      {/* mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={glassLight}>
        {NAV.map(({ href, label, Icon }) => {
          const on = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold"
              style={{ background: on ? CAMEL : "transparent", color: INK }}>
              <Icon size={15} strokeWidth={2.4} />
              {label}
            </Link>
          );
        })}
      </div>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-5 md:pb-10 md:pt-8">{children}</main>
    </div>
  );
}
