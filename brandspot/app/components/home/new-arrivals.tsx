'use client';
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";
import ProductActions from "../cart/product-actions";

import type { ProductRow } from "../../lib/queries";

const COPY = {
  ar: {
    eyebrow: "وصل حديثاً",
    title: "أحدث القطع في براند سبوت",
    subtitle: "قطع أصلية تُضاف أسبوعياً من زارا و H&M و GAP و Next.",
    all: "الكل",
    women: "نساء",
    men: "رجال",
    kids: "أطفال",
    unit: "د.أ",
    viewAll: "شاهد الكل",
    wish: "أضف للمفضّلة",
    empty: "لا توجد قطع في هذا القسم بعد.",
  },
  en: {
    eyebrow: "New in",
    title: "The latest at brand.spot",
    subtitle: "Original pieces added weekly from Zara, H&M, GAP and Next.",
    all: "All",
    women: "Women",
    men: "Men",
    kids: "Kids",
    unit: "JD",
    viewAll: "View all",
    wish: "Add to wishlist",
    empty: "Nothing in this department yet.",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;
const filters = ["all", "women", "men", "kids"] as const;

export default function NewArrivals({ products }: { products: ProductRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const railRef = React.useRef<HTMLDivElement>(null);
  const [filter, setFilter] = React.useState<(typeof filters)[number]>("all");

  const shown = filter === "all" ? products : products.filter((p) => p.dept === filter);

  // sort_order 0 is the card image the admin picked
  const cover = (p: ProductRow) =>
    [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;

  // One card + gap. In RTL, scrollLeft runs negative, so the sign flips.
  const scrollByCard = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 260) + 16;
    rail.scrollBy({ left: amount * dir * (isAr ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
  };

  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <section className="relative w-full py-20">
      <div className="mx-auto max-w-6xl px-5">
        {/* ── header row ── */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p
              className="text-[11px] font-bold"
              style={{ color: CAMEL, letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}
            >
              {c.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>
              {c.title}
            </h2>
            <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed" style={{ color: "rgba(20,20,20,0.75)" }}>
              {c.subtitle}
            </p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="previous"
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ ...glassLight, color: INK }}
            >
              <PrevIcon size={18} strokeWidth={2.2} />
            </button>
            <button
              onClick={() => scrollByCard(1)}
              aria-label="next"
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ ...glassLight, color: INK }}
            >
              <NextIcon size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* ── department filter, one glass pill with a sliding camel marker ── */}
        <div className="mt-7 inline-flex rounded-full p-1" style={glassLight}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="relative rounded-full px-4 py-2 text-[13px] font-bold"
              style={{ color: filter === f ? INK : "rgba(20,20,20,0.72)" }}
            >
              {filter === f ? (
                <motion.span
                  layoutId="arrivals-filter"
                  className="absolute inset-0 rounded-full"
                  style={{ background: CAMEL }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative">{c[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── the rail: full-bleed so cards run off the edge ── */}
      <div
        ref={railRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "1.25rem" }}
      >
        {/* keeps the first card aligned with the max-w-6xl grid above */}
        <div aria-hidden className="shrink-0" style={{ width: "max(0px, calc((100vw - 72rem) / 2 - 1.25rem))" }} />

        {shown.map((p, i) => (
          <motion.article
            key={p.id}
            data-card
            layout={!reduce}
            initial={reduce ? undefined : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: Math.min(i * 0.05, 0.3) }}
            className="group relative w-[258px] shrink-0 snap-start md:w-[288px]"
          >
            <Link
              href={`/product/${p.slug}`}
              className="relative block aspect-[3/4] overflow-hidden rounded-[26px]"
              style={{ border: "1px solid rgba(20,20,20,0.06)", boxShadow: "0 22px 44px -28px rgba(20,20,20,0.65)" }}
            >
              {cover(p) ? (
                <Image
                  src={cover(p)!}
                  alt={lang === "ar" ? p.name_ar : p.name_en}
                  fill
                  sizes="(max-width: 768px) 258px, 288px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
              ) : (
                <span className="absolute inset-0" style={{ background: "rgba(20,20,20,0.06)" }} />
              )}

              {p.was_price ? (
                <span
                  className="absolute top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                  style={{ insetInlineStart: "0.75rem", background: CAMEL, color: INK }}
                >
                  -{Math.round((1 - Number(p.price) / Number(p.was_price)) * 100)}%
                </span>
              ) : null}



              {/* glass price plate, refracting the photo behind it */}
              <div
                className="absolute bottom-3 flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5"
                style={{ ...glassLight, insetInline: "0.75rem", color: INK }}
              >
                <span className="flex min-w-0 flex-col text-start">
                  <span className="truncate text-[10px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>
                    {p.brands?.name ?? ""}
                  </span>
                  <span className="truncate text-[13px] font-bold leading-tight">{lang === "ar" ? p.name_ar : p.name_en}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="text-[13px] font-extrabold">
                    {Number(p.price).toFixed(2)} <span className="text-[10px]">{c.unit}</span>
                  </span>
                  {p.was_price ? (
                    <span className="text-[10px] font-bold line-through" style={{ color: "rgba(20,20,20,0.5)" }}>
                      {Number(p.was_price).toFixed(2)}
                    </span>
                  ) : null}
                </span>
              </div>
            </Link>

            <div className="mt-3 flex justify-center">
              <ProductActions
                dept={p.dept}
                stock={p.stock}
                variants={p.product_variants ?? []}
                line={{
                  productId: p.id,
                  slug: p.slug,
                  name_ar: p.name_ar,
                  name_en: p.name_en,
                  brand: p.brands?.name ?? null,
                  price: Number(p.price),
                  image: cover(p),
                }}
              />
            </div>
          </motion.article>
        ))}

        {shown.length ? (
          <Link
            href="/shop"
            className="flex w-[258px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[26px] text-[14px] font-bold md:w-[288px]"
            style={{ ...glassLight, color: INK, aspectRatio: "3 / 4" }}
          >
            <ArrowUpRight size={22} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
            {c.viewAll}
          </Link>
        ) : (
          <p className="py-16 text-[14px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>
            {c.empty}
          </p>
        )}
      </div>
    </section>
  );
}
