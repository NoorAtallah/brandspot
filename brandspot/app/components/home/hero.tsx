'use client';
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HeroCarousel, type HeroCarouselItem } from "../ui/hero-carousel";
import { glass, CAMEL, INK, PAPER } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

const U = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1600&auto=format&fit=crop`;

/* accent = the hue the whole backdrop grades to when this card takes focus.
   Kept inside the camel/clay/ink family so the brand holds across the swing. */
const LOOKS: { image: string; accent: string; ar: string; en: string; credit: { ar: string; en: string } }[] = [
  { image: "/1.jpeg",   accent: "#C7A781", ar: "الجديد\nللنساء",   en: "New in\nWomen",          credit: { ar: "Eligo",       en: "{Eligo}" } },
  { image: "/2.jpeg",     accent: "#7c6244", ar: "أساسيات\nالرجال",  en: "Men's\nEssentials",      credit: { ar: "Kappa",        en: "Kappa" } },
  { image: "/3.jpeg",    accent: "#9c7e56", ar: "إطلالات\nالأطفال", en: "Kids'\nLooks",           credit: { ar: "Giggles",        en: "Giggles" } },
  { image: "/4.jpeg", accent: "#b08968", ar: "فساتين\nالموسم",   en: "Dresses\nof the Season", credit: { ar: "Lee cooper",       en: "Lee cooper" } },
  { image: "/5.jpeg",   accent: "#5d5346", ar: "دينم\nلكل يوم",    en: "Denim\nEvery Day",       credit: { ar: "Lee cooper",     en: "Lee cooper" } },
  { image: "/6.jpeg",  accent: "#8a7a63", ar: "الماركات\nكاملة",  en: "All the\nBrands",        credit: { ar: "Eligo", en: "Eligo" } },
];

const deptKeys = ["women", "men", "kids"] as const;

export default function Hero() {
  const { t, lang, isAr } = useLang();
  const reduce = useReducedMotion();

  const items: HeroCarouselItem[] = LOOKS.map((l, i) => ({
    id: i,
    title: l[lang],
    image: l.image,
    credit: l.credit[lang],
    meta: [t.eyebrow],
    accent: l.accent,
  }));

  const actions = (
    <>
      {deptKeys.map((k) => (
        <motion.div key={k} whileHover={reduce ? {} : { y: -2 }} whileTap={reduce ? {} : { scale: 0.96 }}>
        <Link
          href={`/shop?dept=${k}`}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white"
          style={glass}
        >
          {t.depts[k].label}
          <span className="text-[10px] font-bold text-white/90">{t.depts[k].hint}</span>
          <ArrowUpRight size={14} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
        </Link>
        </motion.div>
      ))}

      <motion.div whileHover={reduce ? {} : { y: -2 }} whileTap={reduce ? {} : { scale: 0.96 }}>
        <Link
          href="/shop"
          className="inline-flex rounded-full px-5 py-2.5 text-[13px] font-extrabold"
          style={{ background: PAPER, color: INK, boxShadow: "0 12px 28px -14px rgba(0,0,0,0.9)" }}
        >
          {t.cta1}
        </Link>
      </motion.div>
    </>
  );

  return (
    <section className="relative h-[92vh] min-h-[36rem] w-full">
      <HeroCarousel items={items} defaultIndex={2} autoplay autoplayDelay={5200} rtl={isAr} actions={actions} scrollHint={isAr ? "تابع" : "Scroll"} />
    </section>
  );
}
