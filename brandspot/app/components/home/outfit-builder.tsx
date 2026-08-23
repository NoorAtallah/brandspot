'use client';
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

type Item = { id: string; src: string; brand: string; price: number; ar: string; en: string };

const q = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

const TOPS: Item[] = [
  { id: "t1", src: q("photo-1622290291468-a28f7a7dc6a8"), brand: "Zara Kids", price: 9.9, ar: "تي شيرت قطن", en: "Cotton Tee" },
  { id: "t2", src: q("photo-1560506840-ec148e82a604"), brand: "H&M", price: 12.5, ar: "فستان بأكمام", en: "Long-sleeve Dress" },
  { id: "t3", src: q("photo-1564584217132-2271feaeb3c5"), brand: "GAP", price: 15.0, ar: "قميص رمادي", en: "Grey Shirt" },
  { id: "t4", src: q("photo-1622290319146-7b63df48a635"), brand: "Next", price: 8.75, ar: "أفرول أطفال", en: "Baby Onesie" },
];

const BOTTOMS: Item[] = [
  { id: "b1", src: q("photo-1714143136372-ddaf8b606da7"), brand: "Next", price: 12.5, ar: "جينز أزرق", en: "Blue Jeans" },
  { id: "b2", src: q("photo-1602293589930-45aad59ba3ab"), brand: "Zara Kids", price: 11.0, ar: "جينز مستقيم", en: "Straight Jeans" },
  { id: "b3", src: q("photo-1542272604-787c3835535d"), brand: "H&M", price: 9.0, ar: "بنطال دينم", en: "Denim Bottoms" },
  { id: "b4", src: q("photo-1576995853123-5a10305d93c0"), brand: "GAP", price: 13.0, ar: "بنطال كاجوال", en: "Casual Trousers" },
];

const COPY = {
  ar: { eyebrow: "نسّق إطلالة", title: "ركّب الإطلالة المثالية", subtitle: "بدّل بين القطع العلوية والسفلية، ثم أضِف الطقم كاملاً للحقيبة.", top: "القطعة العلوية", bottom: "القطعة السفلية", total: "الإجمالي", add: "أضِف الطقم", added: "تمت الإضافة", unit: "د.أ" },
  en: { eyebrow: "Build a look", title: "Mix & match the perfect outfit", subtitle: "Swap the top and the bottom, then add the whole set to your bag.", top: "Top", bottom: "Bottom", total: "Total", add: "Add outfit", added: "Added", unit: "JD" },
} as const;

function Arrow({ onClick, Icon, label }: { onClick: () => void; Icon: typeof ChevronLeft; label: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileTap={reduce ? {} : { scale: 0.9 }}
      whileHover={reduce ? {} : { scale: 1.08 }}
      className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
      style={{ ...glassLight, color: INK }}
    >
      <Icon size={18} strokeWidth={2.2} />
    </motion.button>
  );
}

function Shelf({ item, label, onPrev, onNext, PrevIcon, NextIcon, lang, isAr, dir }: {
  item: Item; label: string; onPrev: () => void; onNext: () => void;
  PrevIcon: typeof ChevronLeft; NextIcon: typeof ChevronLeft; lang: "ar" | "en"; isAr: boolean; dir: number;
}) {
  const reduce = useReducedMotion();
  const c = COPY[lang];
  return (
    <div className="relative">
      <p className="mb-2 text-[10px] font-extrabold" style={{ color: "rgba(20,20,20,0.45)", letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}>
        {label}
      </p>

      <div className="flex items-center gap-3">
        <Arrow onClick={onPrev} Icon={PrevIcon} label="prev" />

        <div className="relative flex-1 aspect-[16/10] md:aspect-[16/7] overflow-hidden rounded-[26px]"
          style={{ border: "1px solid rgba(20,20,20,0.06)", boxShadow: "0 18px 44px -22px rgba(20,20,20,0.45)" }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={item.id}
              custom={dir}
              initial={reduce ? {} : { opacity: 0, x: dir * 40, scale: 1.04 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduce ? {} : { opacity: 0, x: dir * -40, scale: 1.02 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image src={item.src} alt={item[lang]} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
            </motion.div>
          </AnimatePresence>

          {/* glass chip floating over the photo */}
          <div className="absolute bottom-3 rounded-2xl px-4 py-2.5"
            style={{ ...glassLight, insetInlineStart: "0.75rem", color: INK }}>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>{item.brand}</span>
            <span className="block text-[13px] font-bold leading-tight">
              {item[lang]} · {item.price.toFixed(2)} {c.unit}
            </span>
          </div>
        </div>

        <Arrow onClick={onNext} Icon={NextIcon} label="next" />
      </div>
    </div>
  );
}

export default function OutfitBuilder() {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const [ti, setTi] = useState(0);
  const [bi, setBi] = useState(0);
  const [tDir, setTDir] = useState(1);
  const [bDir, setBDir] = useState(1);
  const [added, setAdded] = useState(false);

  const top = TOPS[ti], bottom = BOTTOMS[bi];
  const total = top.price + bottom.price;

  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const move = (
    set: React.Dispatch<React.SetStateAction<number>>,
    setDir: React.Dispatch<React.SetStateAction<number>>,
    len: number,
    d: number
  ) => { setDir(d); set((i) => (i + d + len) % len); };

  const addToBag = () => { setAdded(true); setTimeout(() => setAdded(false), 1600); };

  return (
    <section className="relative w-full px-5 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-bold" style={{ color: CAMEL, letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}>{c.eyebrow}</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.02em" }}>{c.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "rgba(20,20,20,0.62)" }}>{c.subtitle}</p>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-10 max-w-3xl rounded-[34px] p-5 md:p-7"
        style={glassLight}
      >
        <Shelf item={top} label={c.top} lang={lang} isAr={isAr} dir={tDir}
          onPrev={() => move(setTi, setTDir, TOPS.length, -1)}
          onNext={() => move(setTi, setTDir, TOPS.length, 1)}
          PrevIcon={PrevIcon} NextIcon={NextIcon} />

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "rgba(20,20,20,0.10)" }} />
          <span className="text-[11px] font-extrabold" style={{ color: CAMEL }}>+</span>
          <span className="h-px flex-1" style={{ background: "rgba(20,20,20,0.10)" }} />
        </div>

        <Shelf item={bottom} label={c.bottom} lang={lang} isAr={isAr} dir={bDir}
          onPrev={() => move(setBi, setBDir, BOTTOMS.length, -1)}
          onNext={() => move(setBi, setBDir, BOTTOMS.length, 1)}
          PrevIcon={PrevIcon} NextIcon={NextIcon} />

        <div className="mt-6 flex items-center justify-between gap-4 pt-5" style={{ borderTop: "1px solid rgba(20,20,20,0.08)" }}>
          <div className="text-start">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(20,20,20,0.45)" }}>{c.total}</p>
            <motion.p key={total} initial={reduce ? undefined : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
              className="text-2xl font-extrabold" style={{ color: INK }}>
              {total.toFixed(2)} <span className="text-xs font-bold">{c.unit}</span>
            </motion.p>
          </div>

          <motion.button onClick={addToBag} whileTap={reduce ? {} : { scale: 0.96 }}
            className="flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold"
            style={{ background: added ? INK : CAMEL, color: added ? "#fff" : INK, boxShadow: "0 10px 24px -12px rgba(20,20,20,0.6)" }}>
            {added ? <><Check size={16} strokeWidth={3} /> {c.added}</> : <><ShoppingBag size={16} /> {c.add}</>}
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
