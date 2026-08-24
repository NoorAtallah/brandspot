'use client';
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Truck, Wallet, RotateCcw, ArrowUpRight } from "lucide-react";
import type { ProductDetail as Detail, ProductRow } from "../../../lib/queries";
import { useLang } from "../../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../../lib/glass";
import ProductActions from "../../../components/cart/product-actions";

const COPY = {
  ar: {
    unit: "د.أ", off: "خصم", sold: "غير متوفر حالياً", left: "بقي القليل",
    details: "تفاصيل القطعة", related: "قطع مشابهة", home: "الرئيسية",
    cod: "الدفع عند الاستلام", delivery: "توصيل لكل الأردن", returns: "إرجاع خلال ١٤ يوم",
  },
  en: {
    unit: "JD", off: "off", sold: "Out of stock", left: "Only a few left",
    details: "Details", related: "You may also like", home: "Home",
    cod: "Cash on delivery", delivery: "Delivery across Jordan", returns: "14-day returns",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function ProductDetailView({ product, related }: { product: Detail; related: ProductRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const [active, setActive] = React.useState(0);

  const name = isAr ? product.name_ar : product.name_en;
  const description = isAr ? product.description_ar : product.description_en;
  const price = Number(product.price);
  const was = product.was_price ? Number(product.was_price) : null;
  const soldOut = product.stock <= 0;
  const cover = (p: ProductRow) => [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 md:pt-32">
      <nav className="mb-5 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.6)" }}>
        <Link href="/">{c.home}</Link>
        <span>/</span>
        <span style={{ color: INK }}>{name}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        {/* ── gallery ── */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col gap-3"
        >
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-[30px]"
            style={{ border: "1px solid rgba(20,20,20,0.06)", boxShadow: "0 26px 54px -30px rgba(20,20,20,0.6)", background: "rgba(20,20,20,0.05)" }}
          >
            {images[active] ? (
              <Image
                key={images[active]!.url}
                src={images[active]!.url}
                alt={name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            ) : null}

            {was ? (
              <span className="absolute top-4 rounded-full px-3 py-1.5 text-[11px] font-extrabold"
                style={{ insetInlineStart: "1rem", background: CAMEL, color: INK }}>
                {Math.round((1 - price / was) * 100)}% {c.off}
              </span>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl"
                  style={{ border: `2px solid ${i === active ? CAMEL : "rgba(20,20,20,0.08)"}` }}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>

        {/* ── details ── */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.08 }}
        >
          {product.brands?.name ? (
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: CAMEL }}>
              {product.brands.name}
            </p>
          ) : null}

          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>
            {name}
          </h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-extrabold" style={{ color: INK }}>
              {price.toFixed(2)} <span className="text-sm">{c.unit}</span>
            </span>
            {was ? (
              <span className="text-[15px] font-bold line-through" style={{ color: "rgba(20,20,20,0.45)" }}>
                {was.toFixed(2)}
              </span>
            ) : null}
          </div>

          {product.categories ? (
            <p className="mt-2 text-[12.5px] font-bold" style={{ color: "rgba(20,20,20,0.6)" }}>
              {isAr ? product.categories.name_ar : product.categories.name_en}
            </p>
          ) : null}

          {soldOut ? (
            <p className="mt-4 inline-flex rounded-full px-4 py-2 text-[12.5px] font-extrabold" style={{ background: "rgba(20,20,20,0.10)", color: INK }}>
              {c.sold}
            </p>
          ) : product.stock <= 3 ? (
            <p className="mt-4 inline-flex rounded-full px-4 py-2 text-[12.5px] font-extrabold" style={{ background: "rgba(199,167,129,0.25)", color: INK }}>
              {c.left}
            </p>
          ) : null}

          <div className="mt-6 rounded-[26px] p-5" style={glassLight}>
            <ProductActions
              dept={product.dept}
              stock={product.stock}
              variants={product.product_variants ?? []}
              line={{
                productId: product.id,
                slug: product.slug,
                name_ar: product.name_ar,
                name_en: product.name_en,
                brand: product.brands?.name ?? null,
                price,
                image: images[0]?.url ?? null,
              }}
            />
          </div>

          {description ? (
            <section className="mt-7">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "rgba(20,20,20,0.6)" }}>
                {c.details}
              </h2>
              <p className="mt-2 text-[15px] font-medium leading-relaxed" style={{ color: "rgba(20,20,20,0.78)" }}>
                {description}
              </p>
            </section>
          ) : null}

          <ul className="mt-7 flex flex-col gap-2.5">
            {[
              { Icon: Wallet, label: c.cod },
              { Icon: Truck, label: c.delivery },
              { Icon: RotateCcw, label: c.returns },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-[13.5px] font-bold" style={{ color: INK }}>
                <Icon size={17} strokeWidth={2.3} style={{ color: CAMEL }} />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── related ── */}
      {related.length ? (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.02em" }}>{c.related}</h2>

          <div className="mt-5 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/product/${r.slug}`}
                className="group w-[220px] shrink-0"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[24px]"
                  style={{ border: "1px solid rgba(20,20,20,0.06)", background: "rgba(20,20,20,0.05)" }}>
                  {cover(r) ? (
                    <Image src={cover(r)!} alt="" fill sizes="220px" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                  ) : null}
                </div>
                <p className="mt-2.5 flex items-center gap-1 text-[13.5px] font-bold" style={{ color: INK }}>
                  {isAr ? r.name_ar : r.name_en}
                  <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
                </p>
                <p className="text-[12.5px] font-extrabold" style={{ color: "rgba(20,20,20,0.7)" }}>
                  {Number(r.price).toFixed(2)} {c.unit}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
