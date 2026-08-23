import Link from "next/link";
import { Shirt, FolderTree, Tag, Sparkles, Receipt, ArrowUpRight } from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { glassLight, CAMEL, INK } from "../../lib/glass";

async function counts() {
  const supabase = await createClient();
  const tables = ["products", "categories", "brands", "looks", "orders"] as const;
  const rows = await Promise.all(
    tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true }))
  );
  return Object.fromEntries(tables.map((t, i) => [t, rows[i]!.count ?? 0])) as Record<(typeof tables)[number], number>;
}

export default async function Overview() {
  const c = await counts();

  const cards = [
    { href: "/admin/products", label: "Products", value: c.products, Icon: Shirt },
    { href: "/admin/categories", label: "Categories", value: c.categories, Icon: FolderTree },
    { href: "/admin/brands", label: "Brands", value: c.brands, Icon: Tag },
    { href: "/admin/looks", label: "Looks", value: c.looks, Icon: Sparkles },
    { href: "/admin/orders", label: "Orders", value: c.orders, Icon: Receipt },
  ];

  return (
    <>
      <h1 className="text-xl font-extrabold sm:text-2xl md:text-3xl" style={{ color: INK, letterSpacing: "-0.02em" }}>Overview</h1>
      <p className="mt-1 text-[13.5px] font-medium" style={{ color: "rgba(20,20,20,0.7)" }}>
        Everything the storefront shows is managed from here.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(({ href, label, value, Icon }) => (
          <Link key={href} href={href} className="group rounded-[26px] p-5" style={glassLight}>
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: CAMEL, color: INK }}>
                <Icon size={18} strokeWidth={2.4} />
              </span>
              <ArrowUpRight size={18} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: CAMEL }} />
            </div>
            <p className="mt-4 text-2xl font-extrabold sm:text-3xl" style={{ color: INK }}>{value}</p>
            <p className="text-[13px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>{label}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
