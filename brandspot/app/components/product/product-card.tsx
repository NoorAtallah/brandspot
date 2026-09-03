'use client';
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageOff } from "lucide-react";
import type { ProductRow } from "../../lib/queries";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../lib/glass";

const ease = [0.22, 1, 0.36, 1] as const;

/** The card used by the shop grid and anywhere else a product is listed. */
export default function ProductCard({ product: p, index = 0 }: { product: ProductRow; index?: number }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();

  const cover = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
  const name = isAr ? p.name_ar : p.name_en;
  const unit = isAr ? "د.أ" : "JD";

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease, delay: Math.min(index * 0.04, 0.25) }}
      className="group flex flex-col"
    >
      <Link
        href={`/product/${encodeURIComponent(p.slug)}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-[26px]"
        style={{ border: "1px solid rgba(20,20,20,0.06)", boxShadow: "0 22px 44px -30px rgba(20,20,20,0.6)", background: "rgba(20,20,20,0.05)" }}
      >
        {cover ? (
          <Image src={cover} alt={name} fill sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        ) : (
          // No photo uploaded yet — say so quietly rather than leaving a void.
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(199,167,129,0.10)" }}>
            <ImageOff size={26} strokeWidth={1.8} style={{ color: "rgba(20,20,20,0.28)" }} />
            <span className="text-[11px] font-bold" style={{ color: "rgba(20,20,20,0.4)" }}>
              {isAr ? "لا توجد صورة" : "No photo yet"}
            </span>
          </span>
        )}

        {p.was_price ? (
          <span className="absolute top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
            style={{ insetInlineStart: "0.75rem", background: CAMEL, color: INK }}>
            -{Math.round((1 - Number(p.price) / Number(p.was_price)) * 100)}%
          </span>
        ) : null}

        {p.stock <= 0 ? (
          <span className="absolute inset-0 flex items-start justify-center pt-6"
            style={{ background: "rgba(249,248,246,0.55)" }}>
            <span className="rounded-full px-3 py-1.5 text-[11px] font-extrabold"
              style={{ background: "rgba(20,20,20,0.85)", color: "#fff" }}>
              {isAr ? "غير متوفر" : "Out of stock"}
            </span>
          </span>
        ) : null}

        <div className="absolute bottom-3 flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5"
          style={{ ...glassLight, insetInline: "0.75rem", color: INK }}>
          <span className="flex min-w-0 flex-col text-start">
            {p.brands?.name ? (
              <span className="truncate text-[10px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>{p.brands.name}</span>
            ) : null}
            <span className="truncate text-[13px] font-bold leading-tight">{name}</span>
          </span>
          <span className="flex shrink-0 flex-col items-end">
            <span className="text-[13px] font-extrabold">{Number(p.price).toFixed(2)} <span className="text-[10px]">{unit}</span></span>
            {p.was_price ? (
              <span className="text-[10px] font-bold line-through" style={{ color: "rgba(20,20,20,0.5)" }}>{Number(p.was_price).toFixed(2)}</span>
            ) : null}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
