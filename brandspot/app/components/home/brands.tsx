'use client';
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

import type { BrandRow } from "../../lib/queries";

const COPY = {
  ar: {
    eyebrow: "ماركات أصلية",
    title: "تسوّق حسب الماركة",
    subtitle: "كل قطعة مستوردة أصلية ومضمونة — نعمل مباشرة مع الموردين المعتمدين.",
    items: "قطعة",
    all: "كل الماركات",
    guarantee: "ضمان الأصالة على كل طلب",
  },
  en: {
    eyebrow: "Original brands",
    title: "Shop by brand",
    subtitle: "Every piece is imported, original and guaranteed — sourced directly from authorised suppliers.",
    items: "pieces",
    all: "All brands",
    guarantee: "Authenticity guaranteed on every order",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Brands({ brands }: { brands: BrandRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  return (
    <section id="brands" className="relative w-full px-5 py-20 scroll-mt-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl"
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
          <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: "rgba(20,20,20,0.75)" }}>
            {c.subtitle}
          </p>
        </motion.div>

        {/* ── brand tiles ── */}
        <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {brands.map((b, i) => (
            <motion.a
              key={b.id}
              href="#"
              initial={reduce ? undefined : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease, delay: Math.min(i * 0.06, 0.3) }}
              whileHover={reduce ? {} : { y: -4 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] p-5 md:p-6"
              style={{ ...glassLight, minHeight: "9.5rem" }}
            >
              {/* camel wash that wakes up on hover */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: `radial-gradient(22rem 14rem at 100% 0%, ${CAMEL}, transparent 70%)` }}
                initial={{ opacity: 0 }}
                whileHover={reduce ? {} : { opacity: 0.22 }}
                transition={{ duration: 0.45, ease }}
              />

              <div className="relative flex items-start justify-between gap-3">
                <span className="flex flex-col">
                  <span className="text-[22px] font-extrabold leading-none md:text-[26px]" style={{ color: INK, letterSpacing: "-0.02em" }}>
                    {b.name}
                  </span>
                  {isAr && b.name_ar ? (
                    <span className="mt-1.5 text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.62)" }}>
                      {b.name_ar}
                    </span>
                  ) : null}
                </span>
                <ArrowUpRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }}
                />
              </div>

              <div className="relative mt-6 flex items-end justify-between gap-3">
                <span className="text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>
                  {(isAr ? b.note_ar : b.note_en) ?? ""}
                </span>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: CAMEL, color: INK }}>
                  {b.product_count} {c.items}
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* ── guarantee ribbon ── */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[26px] px-6 py-5"
          style={glassLight}
        >
          <span className="flex items-center gap-2.5 text-[14px] font-bold" style={{ color: INK }}>
            <BadgeCheck size={20} strokeWidth={2.2} style={{ color: CAMEL }} />
            {c.guarantee}
          </span>
          <motion.button
            whileHover={reduce ? {} : { y: -2 }}
            whileTap={reduce ? {} : { scale: 0.97 }}
            className="rounded-full px-6 py-3 text-[13px] font-extrabold"
            style={{ background: INK, color: "#fff", boxShadow: "0 12px 26px -14px rgba(20,20,20,0.9)" }}
          >
            {c.all}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
