
'use client';
import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, ShoppingBag, Check, Globe, type LucideIcon } from "lucide-react";

const CAMEL = "#C7A781", PAPER = "#F9F8F6", INK = "#141414";
const HERO_IMAGE = "https://images.unsplash.com/photo-1611708314849-8bb91fe0fa56?q=80&w=2670&auto=format&fit=crop";
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap');`;

const MAP = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='60'><defs><linearGradient id='r' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient></defs><rect width='100%' height='100%' fill='#000'/><rect width='100%' height='100%' fill='url(#r)'/><rect width='100%' height='100%' fill='url(#g)' style='mix-blend-mode:screen'/></svg>`);

const glass = {
  backdropFilter: "url(#liquid-glass) blur(2px) saturate(140%) brightness(1.05)",
  WebkitBackdropFilter: "blur(10px) saturate(140%)",
  background: "rgba(255,255,255,0.12)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(255,255,255,0.35), 0 12px 40px rgba(20,20,20,0.28)",
  border: "1px solid rgba(255,255,255,0.5)",
};

const PATHS = {
  polo: "M35 18 L28 14 L14 26 L22 38 L30 33 L30 84 Q30 88 34 88 L66 88 Q70 88 70 84 L70 33 L78 38 L86 26 L72 14 L65 18 Q58 26 50 26 Q42 26 35 18 Z",
  cardigan: "M35 18 L28 14 L10 40 L18 52 L28 44 L28 84 Q28 88 32 88 L68 88 Q72 88 72 84 L72 44 L82 52 L90 40 L72 14 L65 18 Q58 26 50 26 Q42 26 35 18 Z",
  dress: "M38 16 L30 24 L38 34 L38 40 L24 84 Q23 88 27 88 L73 88 Q77 88 76 84 L62 40 L62 34 L70 24 L62 16 Q56 24 50 24 Q44 24 38 16 Z",
  skirt: "M28 30 L72 30 L84 84 Q84 88 80 88 L20 88 Q16 88 16 84 Z",
  pants: "M30 22 L70 22 L67 52 L61 86 Q61 88 59 88 L53 88 Q51 88 51 86 L50 56 L49 86 Q49 88 47 88 L41 88 Q39 88 39 86 L33 52 Z",
};

function Garment({ type, color, size = 88 }: { type: keyof typeof PATHS; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" }}>
      <path d={PATHS[type]} fill={color} />
      <path d={PATHS[type]} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      {type === "cardigan" && <line x1="50" y1="30" x2="50" y2="86" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />}
      {type === "skirt" && <rect x="30" y="27" width="40" height="7" rx="3" fill={color} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />}
    </svg>
  );
}

const TOPS = [
  { id: "t1", g: "polo", color: "#9CC3E4", brand: "Zara Kids", price: 9.90, ar: "بولو قطن", en: "Piqué Polo" },
  { id: "t2", g: "dress", color: "#F3A9C0", brand: "H&M", price: 12.50, ar: "فستان كشكش", en: "Ruffle Dress" },
  { id: "t3", g: "cardigan", color: "#243154", brand: "GAP", price: 15.00, ar: "كارديجان تريكو", en: "Knit Cardigan" },
  { id: "t4", g: "polo", color: "#8E3346", brand: "Next", price: 8.75, ar: "بولو كلاسيك", en: "Classic Polo" },
];
const BOTTOMS = [
  { id: "b1", g: "skirt", color: "#2E2E2E", brand: "Zara Kids", price: 11.00, ar: "تنورة بليسيه", en: "Pleated Skirt" },
  { id: "b2", g: "pants", color: "#D9C7A3", brand: "Next", price: 12.50, ar: "بنطال تشينو", en: "Chino Pants" },
  { id: "b3", g: "skirt", color: "#C7A781", brand: "H&M", price: 9.00, ar: "تنورة سكيتر", en: "Skater Skirt" },
  { id: "b4", g: "pants", color: "#3A5B86", brand: "GAP", price: 13.00, ar: "جينز بوتكات", en: "Bootcut Jeans" },
];

const COPY = {
  ar: { eyebrow: "نسّق إطلالة", title: "ركّب الإطلالة المثالية", subtitle: "بدّل بين القطع العلوية والسفلية، ثم أضِف الطقم كاملاً للحقيبة.", total: "الإجمالي", add: "أضِف الطقم", added: "تمت الإضافة", unit: "د.أ", toggle: "EN" },
  en: { eyebrow: "Build a look", title: "Mix & match the perfect outfit", subtitle: "Swap the top and bottom, then add the whole set to your bag.", total: "Total", add: "Add outfit", added: "Added", unit: "JD", toggle: "عربي" },
};

function Chev({ onClick, Icon }) {
  const reduce = useReducedMotion();
  return (
    <motion.button onClick={onClick} whileTap={reduce ? {} : { scale: 0.88 }} whileHover={reduce ? {} : { scale: 1.08 }}
      className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-white" style={glass}>
      <Icon size={17} strokeWidth={2.2} />
    </motion.button>
  );
}

function Peek({ item, side, top }) {
  return (
    <div className="hidden md:flex absolute z-0 h-20 w-20 rounded-2xl items-center justify-center"
      style={{ ...glass, top, transform: "translateY(-50%)", [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: "-88px", opacity: 0.55 }}>
      <Garment type={item.g} color={item.color} size={58} />
    </div>
  );
}

function Row({ item, prev, next, onPrev, onNext, PrevIcon, NextIcon, lang, topPct }) {
  const reduce = useReducedMotion();
  return (
    <>
      <Peek item={prev} side="start" top={topPct} />
      <Peek item={next} side="end" top={topPct} />
      <div className="relative z-10 flex items-center gap-3">
        <Chev onClick={onPrev} Icon={PrevIcon} />
        <div className="relative h-32 w-32 rounded-2xl flex items-center justify-center overflow-hidden" style={glass}>
          <AnimatePresence mode="wait">
            <motion.div key={item.id}
              initial={reduce ? {} : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? {} : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.24 }}>
              <Garment type={item.g} color={item.color} size={92} />
            </motion.div>
          </AnimatePresence>
        </div>
        <Chev onClick={onNext} Icon={NextIcon} />
      </div>
      <div className="relative z-10 mt-2 text-center">
        <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>{item.brand}</span>
        <p className="text-[13px] font-bold text-white">{item[lang]} · {item.price.toFixed(2)} {COPY[lang].unit}</p>
      </div>
    </>
  );
}

function OutfitBuilder({ lang }) {
  const reduce = useReducedMotion();
  const isAr = lang === "ar";
  const c = COPY[lang];
  const [ti, setTi] = useState(0), [bi, setBi] = useState(0), [added, setAdded] = useState(false);
  const top = TOPS[ti], bottom = BOTTOMS[bi];
  const total = top.price + bottom.price;
  const cyc = (set, len, d) => set((i) => (i + d + len) % len);
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;
  const addToBag = () => { setAdded(true); setTimeout(() => setAdded(false), 1600); };

  return (
    <section className="relative w-full overflow-hidden px-5 py-16" style={{ background: "#7c6244" }}>
      {/* busy backdrop so glass refracts */}
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 40%" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,20,20,0.55), rgba(124,98,68,0.55) 45%, rgba(20,20,20,0.6))" }} />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold" style={{ color: CAMEL, letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}>{c.eyebrow}</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-white" style={{ letterSpacing: isAr ? "0" : "-0.02em", textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>{c.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">{c.subtitle}</p>
      </div>

      {/* framed glass column with peeking rows */}
      <div className="relative z-10 mt-10 mx-auto" style={{ width: "min(100%, 320px)" }}>
        <div className="rounded-[30px] p-6 md:p-7 flex flex-col items-center" style={{ ...glass, background: "rgba(255,255,255,0.10)" }}>
          <Row item={top} prev={TOPS[(ti - 1 + TOPS.length) % TOPS.length]} next={TOPS[(ti + 1) % TOPS.length]}
            onPrev={() => cyc(setTi, TOPS.length, -1)} onNext={() => cyc(setTi, TOPS.length, 1)}
            PrevIcon={PrevIcon} NextIcon={NextIcon} lang={lang} topPct="26%" />

          <div className="relative z-20 my-3 h-9 w-9 rounded-full flex items-center justify-center" style={{ background: CAMEL, color: INK, boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>
            <Plus size={18} strokeWidth={2.6} />
          </div>

          <Row item={bottom} prev={BOTTOMS[(bi - 1 + BOTTOMS.length) % BOTTOMS.length]} next={BOTTOMS[(bi + 1) % BOTTOMS.length]}
            onPrev={() => cyc(setBi, BOTTOMS.length, -1)} onNext={() => cyc(setBi, BOTTOMS.length, 1)}
            PrevIcon={PrevIcon} NextIcon={NextIcon} lang={lang} topPct="70%" />

          <div className="relative z-10 mt-5 pt-4 w-full flex items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}>
            <div className="text-start">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{c.total}</p>
              <p className="text-xl font-extrabold text-white">{total.toFixed(2)} <span className="text-xs font-bold">{c.unit}</span></p>
            </div>
            <motion.button onClick={addToBag} whileTap={reduce ? {} : { scale: 0.96 }}
              className="rounded-full px-5 py-3 text-sm font-bold flex items-center gap-2"
              style={{ background: added ? "rgba(255,255,255,0.9)" : CAMEL, color: INK }}>
              {added ? <><Check size={16} strokeWidth={3} /> {c.added}</> : <><ShoppingBag size={16} /> {c.add}</>}
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [lang, setLang] = useState("ar");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const font = lang === "ar" ? "'Tajawal', system-ui, sans-serif" : "'Inter', system-ui, sans-serif";
  return (
    <div dir={dir} style={{ fontFamily: font, position: "relative", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: FONT }} />
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
        <filter id="liquid-glass" colorInterpolationFilters="sRGB">
          <feImage href={MAP} x="0" y="0" width="100%" height="100%" result="map" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="30" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        className="fixed top-4 z-50 flex items-center gap-1.5 rounded-full px-3.5 h-10 text-xs font-bold text-white"
        style={{ insetInlineEnd: "1rem", ...glass }}>
        <Globe size={15} /> {COPY[lang].toggle}
      </button>
      <OutfitBuilder lang={lang} />
    </div>
  );
}