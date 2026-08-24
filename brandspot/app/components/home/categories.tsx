'use client';
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { CategoryRow } from "../../lib/queries";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../lib/glass";

const COPY = {
  ar: {
    eyebrow: "تصفّح الأقسام",
    title: "تسوّق حسب الفئة",
    subtitle: "من الفساتين للدينم لأطقم الأطفال — روح على اللي بدك إياه مباشرة.",
    items: "قطعة",
    women: "نساء", men: "رجال", kids: "أطفال",
  },
  en: {
    eyebrow: "Browse the shop",
    title: "Shop by category",
    subtitle: "Dresses, denim, kids' sets — go straight to what you came for.",
    items: "pieces",
    women: "Women", men: "Men", kids: "Kids",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Categories({ categories }: { categories: CategoryRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  return (
    <section id="categories" className="relative w-full px-5 py-20 scroll-mt-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl"
        >
          <p className="text-[11px] font-bold"
            style={{ color: CAMEL, letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}>
            {c.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>
            {c.title}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: "rgba(20,20,20,0.75)" }}>{c.subtitle}</p>
        </motion.div>

        {/* First tile runs double width, so the grid reads as an editorial layout
            rather than a uniform set of boxes. */}
        <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {categories.map((k, i) => (
            <motion.div
              key={k.id}
              initial={reduce ? undefined : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease, delay: Math.min(i * 0.05, 0.3) }}
              whileHover={reduce ? {} : { y: -4 }}
              className={i === 0 ? "col-span-2 md:row-span-2" : ""}
            >
              <Link
                href={`/shop?category=${k.slug}`}
                className="group relative flex h-full min-h-[9rem] flex-col justify-end overflow-hidden rounded-[26px] p-4 md:min-h-[11rem]"
                style={{ border: "1px solid rgba(20,20,20,0.06)", background: "rgba(20,20,20,0.05)" }}
              >
                {k.image_url ? (
                  <Image
                    src={k.image_url}
                    alt={isAr ? k.name_ar : k.name_en}
                    fill
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 560px" : "(max-width: 768px) 50vw, 280px"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                ) : null}

                <span aria-hidden className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 40%, rgba(20,20,20,0.45))" }} />

                <span className="relative flex items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5" style={{ ...glassLight, color: INK }}>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-extrabold leading-tight">{isAr ? k.name_ar : k.name_en}</span>
                    <span className="text-[11px] font-bold" style={{ color: "rgba(20,20,20,0.6)" }}>
                      {k.dept ? c[k.dept] + " · " : ""}{k.product_count} {c.items}
                    </span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
                    style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
