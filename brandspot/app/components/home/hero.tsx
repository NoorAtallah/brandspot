'use client';
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HeroCarousel, type HeroCarouselItem } from "../ui/hero-carousel";
import { glass, CAMEL, INK, PAPER } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

const U = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1600&auto=format&fit=crop`;

/* accent = the hue the whole backdrop grades to when this card takes focus.
   Kept inside the camel/clay/ink family so the brand holds across the swing. */
const LOOKS: { image: string; accent: string; ar: string; en: string; credit: { ar: string; en: string } }[] = [
  { image: U("photo-1598554747436-c9293d6a588f"), accent: "#C7A781", ar: "الجديد\nللنساء", en: "New in\nWomen", credit: { ar: "زارا", en: "ZARA" } },
  { image: U("photo-1582552938357-32b906df40cb"), accent: "#7c6244", ar: "أساسيات\nالرجال", en: "Men's\nEssentials", credit: { ar: "H&M", en: "H&M" } },
  { image: U("photo-1519238263530-99bdd11df2ea"), accent: "#9c7e56", ar: "إطلالات\nالأطفال", en: "Kids'\nLooks", credit: { ar: "GAP", en: "GAP" } },
  { image: U("photo-1560506840-ec148e82a604"), accent: "#b08968", ar: "فساتين\nالموسم", en: "Dresses\nof the Season", credit: { ar: "نكست", en: "NEXT" } },
  { image: U("photo-1541099649105-f69ad21f3246"), accent: "#5d5346", ar: "دينم\nلكل يوم", en: "Denim\nEvery Day", credit: { ar: "ليفايس", en: "LEVI'S" } },
  { image: U("photo-1566454544259-f4b94c3d758c"), accent: "#8a7a63", ar: "الماركات\nكاملة", en: "All the\nBrands", credit: { ar: "براند سبوت", en: "BRAND.SPOT" } },
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
        <motion.button
          key={k}
          whileHover={reduce ? {} : { y: -2 }}
          whileTap={reduce ? {} : { scale: 0.96 }}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white"
          style={glass}
        >
          {t.depts[k].label}
          <span className="text-[10px] font-bold text-white/90">{t.depts[k].hint}</span>
          <ArrowUpRight size={14} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
        </motion.button>
      ))}

      <motion.button
        whileHover={reduce ? {} : { y: -2 }}
        whileTap={reduce ? {} : { scale: 0.96 }}
        className="rounded-full px-5 py-2.5 text-[13px] font-extrabold"
        style={{ background: PAPER, color: INK, boxShadow: "0 12px 28px -14px rgba(0,0,0,0.9)" }}
      >
        {t.cta1}
      </motion.button>
    </>
  );

  return (
    <section className="relative h-[92vh] min-h-[36rem] w-full">
      <HeroCarousel items={items} defaultIndex={2} autoplay autoplayDelay={5200} rtl={isAr} actions={actions} scrollHint={isAr ? "تابع" : "Scroll"} />
    </section>
  );
}
