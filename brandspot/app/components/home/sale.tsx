'use client';
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, ArrowUpRight } from "lucide-react";
import type { ProductRow } from "../../lib/queries";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import ProductCard from "../product/product-card";

const COPY = {
  ar: {
    eyebrow: "تخفيضات",
    title: "قطع بسعر أقل",
    subtitle: "قطع أصلية بخصومات حقيقية — الكميات محدودة.",
    upTo: "خصم يصل إلى",
    all: "شوف كل التخفيضات",
  },
  en: {
    eyebrow: "On sale",
    title: "Marked down now",
    subtitle: "Original pieces at real discounts — limited quantities.",
    upTo: "Up to",
    all: "See everything on sale",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Sale({ products }: { products: ProductRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];
  const railRef = React.useRef<HTMLDivElement>(null);

  // The steepest discount in the set, for the headline badge.
  const best = products.reduce((max, p) => {
    const off = p.was_price ? 1 - Number(p.price) / Number(p.was_price) : 0;
    return Math.max(max, off);
  }, 0);

  const scrollByCard = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-sale-card]");
    const amount = (card?.offsetWidth ?? 260) + 16;
    rail.scrollBy({ left: amount * dir * (isAr ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
  };

  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <section id="sale" className="relative w-full py-20 scroll-mt-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="flex items-center gap-1.5 text-[11px] font-bold"
              style={{ color: CAMEL, letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}>
              <Flame size={14} strokeWidth={2.6} />
              {c.eyebrow}
            </p>

            <h2 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-extrabold md:text-4xl"
              style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>
              {c.title}
              {best > 0 ? (
                <span className="rounded-full px-3 py-1.5 text-[12px] font-extrabold" style={{ background: CAMEL, color: INK }}>
                  {c.upTo} {Math.round(best * 100)}%
                </span>
              ) : null}
            </h2>

            <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed" style={{ color: "rgba(20,20,20,0.75)" }}>{c.subtitle}</p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => scrollByCard(-1)} aria-label="previous"
              className="flex h-11 w-11 items-center justify-center rounded-full" style={{ ...glassLight, color: INK }}>
              <PrevIcon size={18} strokeWidth={2.2} />
            </button>
            <button onClick={() => scrollByCard(1)} aria-label="next"
              className="flex h-11 w-11 items-center justify-center rounded-full" style={{ ...glassLight, color: INK }}>
              <NextIcon size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "1.25rem" }}
      >
        <div aria-hidden className="shrink-0" style={{ width: "max(0px, calc((100vw - 72rem) / 2 - 1.25rem))" }} />

        {products.map((p, i) => (
          <div key={p.id} data-sale-card className="w-[258px] shrink-0 snap-start md:w-[288px]">
            <ProductCard product={p} index={i} />
          </div>
        ))}

        <Link
          href="/shop?sale=1"
          className="flex w-[258px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[26px] text-[14px] font-bold md:w-[288px]"
          style={{ ...glassLight, color: INK, aspectRatio: "3 / 4" }}
        >
          <ArrowUpRight size={22} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
          {c.all}
        </Link>
      </div>
    </section>
  );
}
