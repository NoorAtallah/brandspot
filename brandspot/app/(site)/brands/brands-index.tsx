'use client';
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { BrandRow } from "../../lib/queries";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../lib/glass";

const COPY = {
  ar: { title: "الماركات", subtitle: "كل ماركة نوفّرها — أصلية ومضمونة.", items: "قطعة", empty: "ما في ماركات بعد." },
  en: { title: "Brands", subtitle: "Every brand we stock — original and guaranteed.", items: "pieces", empty: "No brands yet." },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function BrandsIndex({ brands }: { brands: BrandRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 md:pt-32">
      <h1 className="text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>
        {c.title}
      </h1>
      <p className="mt-2 text-[15px] font-medium" style={{ color: "rgba(20,20,20,0.75)" }}>{c.subtitle}</p>

      {brands.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {brands.map((b, i) => (
            <motion.div
              key={b.id}
              initial={reduce ? undefined : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease, delay: Math.min(i * 0.05, 0.25) }}
              whileHover={reduce ? {} : { y: -4 }}
            >
              <Link
                href={`/brands/${b.slug}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-5 md:p-6"
                style={{ ...glassLight, minHeight: "10rem" }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                  style={{ background: `radial-gradient(22rem 14rem at 100% 0%, ${CAMEL}, transparent 70%)` }} />

                <span className="relative flex items-start justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    {b.logo_url ? (
                      <span className="relative mb-2.5 flex h-14 w-28 items-center justify-center overflow-hidden rounded-xl"
                        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(20,20,20,0.06)" }}>
                        <Image src={b.logo_url} alt={b.name} fill sizes="112px" className="object-contain p-2" />
                      </span>
                    ) : null}
                    <span className="truncate text-[22px] font-extrabold leading-none md:text-[26px]" style={{ color: INK, letterSpacing: "-0.02em" }}>
                      {b.name}
                    </span>
                    {isAr && b.name_ar ? (
                      <span className="mt-1.5 text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.62)" }}>{b.name_ar}</span>
                    ) : null}
                  </span>
                  <ArrowUpRight size={20} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
                </span>

                <span className="relative mt-6 flex items-end justify-between gap-3">
                  <span className="text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>
                    {(isAr ? b.note_ar : b.note_en) ?? ""}
                  </span>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: CAMEL, color: INK }}>
                    {b.product_count} {c.items}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-[15px] font-bold" style={{ color: "rgba(20,20,20,0.65)" }}>{c.empty}</p>
      )}
    </main>
  );
}
