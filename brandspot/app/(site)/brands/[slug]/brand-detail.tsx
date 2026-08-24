'use client';
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import type { BrandRow, ProductRow } from "../../../lib/queries";
import { useLang } from "../../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../../lib/glass";
import ProductCard from "../../../components/product/product-card";

const COPY = {
  ar: {
    home: "الرئيسية", brands: "الماركات", items: "قطعة",
    all: "الكل", women: "نساء", men: "رجال", kids: "أطفال",
    new: "الأحدث", priceAsc: "السعر: من الأقل", priceDesc: "السعر: من الأعلى",
    empty: "ما في قطع من هالماركة حالياً.", guarantee: "ماركة أصلية مضمونة",
  },
  en: {
    home: "Home", brands: "Brands", items: "pieces",
    all: "All", women: "Women", men: "Men", kids: "Kids",
    new: "Newest", priceAsc: "Price: low to high", priceDesc: "Price: high to low",
    empty: "Nothing from this brand right now.", guarantee: "Original brand, guaranteed",
  },
} as const;

const depts = ["women", "men", "kids"] as const;
const ease = [0.22, 1, 0.36, 1] as const;

export default function BrandDetail({
  brand, products, dept, sort,
}: {
  brand: BrandRow;
  products: ProductRow[];
  dept?: string;
  sort: string;
}) {
  const { lang, isAr } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const apply = (patch: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = { dept, sort, ...patch };
    const next = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v && !(k === "sort" && v === "new")) next.set(k, v);
    });
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const Chip = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-2 text-[12.5px] font-extrabold"
      style={{ background: on ? CAMEL : "rgba(255,255,255,0.7)", color: INK, border: `1px solid ${on ? CAMEL : "rgba(20,20,20,0.10)"}` }}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 md:pt-32">
      <nav className="mb-5 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.6)" }}>
        <Link href="/">{c.home}</Link>
        <span>/</span>
        <Link href="/brands">{c.brands}</Link>
        <span>/</span>
        <span style={{ color: INK }}>{brand.name}</span>
      </nav>

      {/* ── brand header ── */}
      <motion.header
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="flex flex-wrap items-center gap-5 rounded-[30px] p-6 md:p-8"
        style={glassLight}
      >
        {brand.logo_url ? (
          <span className="relative flex h-20 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
            style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(20,20,20,0.06)" }}>
            <Image src={brand.logo_url} alt={brand.name} fill sizes="144px" className="object-contain p-3" priority />
          </span>
        ) : null}

        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: "-0.02em" }}>{brand.name}</h1>
          {isAr && brand.name_ar ? (
            <p className="mt-1 text-[14px] font-bold" style={{ color: "rgba(20,20,20,0.65)" }}>{brand.name_ar}</p>
          ) : null}
          {(isAr ? brand.note_ar : brand.note_en) ? (
            <p className="mt-2 text-[14px] font-medium" style={{ color: "rgba(20,20,20,0.75)" }}>
              {isAr ? brand.note_ar : brand.note_en}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
          <span className="flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-extrabold" style={{ background: "rgba(199,167,129,0.22)", color: INK }}>
            <BadgeCheck size={16} strokeWidth={2.4} style={{ color: CAMEL }} />
            {c.guarantee}
          </span>
          <span className="rounded-full px-3.5 py-2 text-[12.5px] font-extrabold" style={{ background: CAMEL, color: INK }}>
            {products.length} {c.items}
          </span>
        </div>
      </motion.header>

      {/* ── filters ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Chip on={!dept} label={c.all} onClick={() => apply({ dept: undefined })} />
        {depts.map((d) => (
          <Chip key={d} on={dept === d} label={c[d]} onClick={() => apply({ dept: dept === d ? undefined : d })} />
        ))}

        <span className="ms-auto flex flex-wrap gap-1.5">
          {([["new", c.new], ["price-asc", c.priceAsc], ["price-desc", c.priceDesc]] as const).map(([value, label]) => (
            <Chip key={value} on={sort === value} label={label} onClick={() => apply({ sort: value })} />
          ))}
        </span>
      </div>

      {/* ── products ── */}
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
