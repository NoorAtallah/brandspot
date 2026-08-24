'use client';
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { ProductRow, ProductFilters } from "../../lib/queries";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import ProductCard from "../../components/product/product-card";

type Brand = { slug: string; name: string; name_ar: string | null };
type Category = { slug: string; name_en: string; name_ar: string; dept: string | null };

const COPY = {
  ar: {
    title: "كل القطع", subtitle: (n: number) => `${n} قطعة متاحة الآن`,
    search: "ابحث عن قطعة…", all: "الكل", women: "نساء", men: "رجال", kids: "أطفال",
    brand: "الماركة", category: "الفئة", sort: "الترتيب",
    new: "الأحدث", priceAsc: "السعر: من الأقل", priceDesc: "السعر: من الأعلى",
    sale: "تخفيضات", clear: "امسح الفلاتر", empty: "ما في قطع تطابق بحثك.", filters: "الفلاتر",
  },
  en: {
    title: "All products", subtitle: (n: number) => `${n} pieces available`,
    search: "Search pieces…", all: "All", women: "Women", men: "Men", kids: "Kids",
    brand: "Brand", category: "Category", sort: "Sort",
    new: "Newest", priceAsc: "Price: low to high", priceDesc: "Price: high to low",
    sale: "On sale", clear: "Clear filters", empty: "Nothing matches that search.", filters: "Filters",
  },
} as const;

const depts = ["women", "men", "kids"] as const;

export default function ShopClient({
  products, filters, brands, categories,
}: {
  products: ProductRow[];
  filters: ProductFilters;
  brands: Brand[];
  categories: Category[];
}) {
  const { lang, isAr } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const c = COPY[lang];

  const [term, setTerm] = React.useState(filters.q ?? "");
  const [openFilters, setOpenFilters] = React.useState(false);

  /** Every control rewrites the query string, so filters survive a reload and are shareable. */
  const apply = (patch: Partial<Record<string, string | undefined>>) => {
    const next = new URLSearchParams();
    // `sale` is a boolean in the filter type but travels as ?sale=1.
    const merged = {
      ...filters,
      sale: filters.sale ? "1" : undefined,
      ...patch,
    } as Record<string, string | undefined>;
    Object.entries(merged).forEach(([k, v]) => {
      if (v && !(k === "sort" && v === "new")) next.set(k, v);
    });
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    apply({ q: term.trim() || undefined });
  };

  // Categories follow the chosen department, so the list never offers a dead end.
  const shownCategories = filters.dept ? categories.filter((k) => !k.dept || k.dept === filters.dept) : categories;
  const active = [filters.dept, filters.brand, filters.category, filters.q, filters.sale ? "1" : undefined].filter(Boolean).length;

  const Chip = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-2 text-[12.5px] font-extrabold"
      style={{
        background: on ? CAMEL : "rgba(255,255,255,0.7)",
        color: INK,
        border: `1px solid ${on ? CAMEL : "rgba(20,20,20,0.10)"}`,
      }}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 md:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>
            {c.title}
          </h1>
          <p className="mt-1.5 text-[14px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>
            {c.subtitle(products.length)}
          </p>
        </div>

        <form onSubmit={submitSearch} className="flex w-full items-center gap-2 rounded-full px-4 py-2.5 sm:w-80" style={glassLight}>
          <Search size={17} strokeWidth={2.4} style={{ color: CAMEL }} />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={c.search}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] font-bold outline-none"
            style={{ color: INK }}
          />
          {term ? (
            <button type="button" onClick={() => { setTerm(""); apply({ q: undefined }); }} aria-label="Clear" style={{ color: "rgba(20,20,20,0.5)" }}>
              <X size={15} strokeWidth={3} />
            </button>
          ) : null}
        </form>
      </div>

      {/* ── filters ── */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Chip on={!filters.dept} label={c.all} onClick={() => apply({ dept: undefined, category: undefined })} />
          {depts.map((d) => (
            <Chip key={d} on={filters.dept === d} label={c[d]} onClick={() => apply({ dept: filters.dept === d ? undefined : d, category: undefined })} />
          ))}
          <Chip on={!!filters.sale} label={c.sale} onClick={() => apply({ sale: filters.sale ? undefined : "1" })} />

          <button
            onClick={() => setOpenFilters((v) => !v)}
            className="ms-auto flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-extrabold"
            style={{ ...glassLight, color: INK }}
          >
            <SlidersHorizontal size={15} strokeWidth={2.4} style={{ color: CAMEL }} />
            {c.filters}
            {active ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]" style={{ background: CAMEL, color: INK }}>
                {active}
              </span>
            ) : null}
          </button>
        </div>

        {openFilters ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden rounded-[26px] p-5"
            style={glassLight}
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "rgba(20,20,20,0.6)" }}>{c.brand}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {brands.map((b) => (
                    <Chip
                      key={b.slug}
                      on={filters.brand === b.slug}
                      label={isAr && b.name_ar ? b.name_ar : b.name}
                      onClick={() => apply({ brand: filters.brand === b.slug ? undefined : b.slug })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "rgba(20,20,20,0.6)" }}>{c.category}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {shownCategories.map((k) => (
                    <Chip
                      key={k.slug}
                      on={filters.category === k.slug}
                      label={isAr ? k.name_ar : k.name_en}
                      onClick={() => apply({ category: filters.category === k.slug ? undefined : k.slug })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "rgba(20,20,20,0.6)" }}>{c.sort}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {([["new", c.new], ["price-asc", c.priceAsc], ["price-desc", c.priceDesc]] as const).map(([value, label]) => (
                    <Chip key={value} on={(filters.sort ?? "new") === value} label={label} onClick={() => apply({ sort: value })} />
                  ))}
                </div>
              </div>
            </div>

            {active ? (
              <button
                onClick={() => { setTerm(""); router.push(pathname, { scroll: false }); }}
                className="mt-5 rounded-full px-5 py-2.5 text-[12.5px] font-extrabold"
                style={{ background: INK, color: "#fff" }}
              >
                {c.clear}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      {/* ── grid ── */}
      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      ) : (
        <p className="mt-16 text-center text-[15px] font-bold" style={{ color: "rgba(20,20,20,0.65)" }}>{c.empty}</p>
      )}
    </main>
  );
}
