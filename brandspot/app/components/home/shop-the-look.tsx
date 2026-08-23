'use client';
import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, ShoppingBag, Check } from "lucide-react";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";
import { useCart } from "../../lib/cart";

import type { LookRow } from "../../lib/queries";

type Pin = LookRow["look_items"][number];

const COPY = {
  ar: {
    eyebrow: "تسوّق الإطلالة",
    title: "الإطلالة كاملة بضغطة",
    subtitle: "اضغط على أي علامة لترى القطعة وسعرها، ثم أضِف الإطلالة كاملة إلى حقيبتك.",
    total: "إجمالي الإطلالة",
    add: "أضِف الإطلالة",
    added: "تمت الإضافة",
    unit: "د.أ",
    hint: "اضغط على العلامات",
  },
  en: {
    eyebrow: "Shop the look",
    title: "The whole outfit, in one tap",
    subtitle: "Tap any marker to see the piece and its price, then add the entire look to your bag.",
    total: "Look total",
    add: "Add the look",
    added: "Added",
    unit: "JD",
    hint: "Tap the markers",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function ShopTheLook({ looks }: { looks: LookRow[] }) {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const { add } = useCart();
  const [lookIdx, setLookIdx] = React.useState(0);
  const [openPin, setOpenPin] = React.useState<string | null>(null);
  const [added, setAdded] = React.useState(false);

  const look = looks[lookIdx];
  // Pins whose product was deleted are dropped rather than rendered blank.
  const pins = (look?.look_items ?? [])
    .filter((p) => p.products)
    .sort((a, b) => a.sort_order - b.sort_order);
  const total = pins.reduce((sum, p) => sum + Number(p.products!.price), 0);

  const pickLook = (i: number) => {
    setLookIdx(i);
    setOpenPin(null);
    setAdded(false);
  };

  const nameOf = (p: Pin) => (isAr ? p.products!.name_ar : p.products!.name_en);

  const addLook = () => {
    pins.forEach((pin) =>
      add({
        productId: pin.products!.id,
        slug: pin.products!.id,
        name_ar: pin.products!.name_ar,
        name_en: pin.products!.name_en,
        brand: pin.products!.brands?.name ?? null,
        price: Number(pin.products!.price),
        image: look?.image_url ?? null,
        size: null,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  // Nothing to show until an admin has published a look with a photo.
  if (!look?.image_url) return null;

  return (
    <section className="relative w-full px-5 py-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
        {/* ── the frame with its pins ── */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="relative aspect-[4/5] overflow-hidden rounded-[30px] md:aspect-[4/4.6]"
          style={{ border: "1px solid rgba(20,20,20,0.06)", boxShadow: "0 30px 60px -34px rgba(20,20,20,0.7)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={look.id}
              initial={reduce ? {} : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? {} : { opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="absolute inset-0"
            >
              <Image src={look.image_url!} alt={isAr ? look.title_ar : look.title_en} fill sizes="(max-width: 768px) 100vw, 620px" className="object-cover" />
            </motion.div>
          </AnimatePresence>

          {/* keeps the glass chips readable wherever they land */}
          <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,20,20,0.18), transparent 30%, transparent 62%, rgba(20,20,20,0.3))" }} />

          {pins.map((pin, i) => {
            const open = openPin === pin.id;
            return (
              <div key={pin.id} className="absolute" style={{ insetInlineStart: `${Number(pin.x)}%`, top: `${Number(pin.y)}%` }}>
                <motion.button
                  onClick={() => setOpenPin(open ? null : pin.id)}
                  aria-expanded={open}
                  aria-label={nameOf(pin)}
                  initial={reduce ? undefined : { opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: 0.25 + i * 0.12 }}
                  whileTap={reduce ? {} : { scale: 0.85 }}
                  className="relative flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                  style={{ ...glassLight, color: INK }}
                >
                  {/* quiet pulse so the markers read as interactive */}
                  {!reduce && !open ? (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${CAMEL}` }}
                      animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
                      transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
                    />
                  ) : null}
                  <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25, ease }}>
                    <Plus size={17} strokeWidth={2.8} style={{ color: open ? CAMEL : INK }} />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {open ? (
                    <motion.div
                      initial={reduce ? undefined : { opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.28, ease }}
                      className="absolute top-6 w-max max-w-[13rem] rounded-2xl px-3.5 py-2.5"
                      style={{ ...glassLight, color: INK, insetInlineStart: "1.25rem" }}
                    >
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>
                        {pin.products!.brands?.name ?? ""}
                      </span>
                      <span className="block text-[13px] font-bold leading-tight">{nameOf(pin)}</span>
                      <span className="mt-0.5 block text-[13px] font-extrabold">
                        {Number(pin.products!.price).toFixed(2)} <span className="text-[10px]">{c.unit}</span>
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}

          <span
            className="absolute bottom-3 rounded-full px-3.5 py-2 text-[11px] font-extrabold"
            style={{ ...glassLight, insetInlineStart: "0.75rem", color: INK }}
          >
            {c.hint}
          </span>
        </motion.div>

        {/* ── the panel ── */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease, delay: 0.08 }}
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

          {/* look switcher */}
          <div className="mt-6 inline-flex rounded-full p-1" style={glassLight}>
            {looks.map((l, i) => (
              <button
                key={l.id}
                onClick={() => pickLook(i)}
                className="relative rounded-full px-4 py-2 text-[13px] font-bold"
                style={{ color: lookIdx === i ? INK : "rgba(20,20,20,0.72)" }}
              >
                {lookIdx === i ? (
                  <motion.span
                    layoutId="look-switch"
                    className="absolute inset-0 rounded-full"
                    style={{ background: CAMEL }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{isAr ? l.title_ar : l.title_en}</span>
              </button>
            ))}
          </div>

          {/* the pieces in this look */}
          <ul className="mt-6 flex flex-col gap-2">
            {pins.map((pin) => {
              const open = openPin === pin.id;
              return (
                <li key={pin.id}>
                  <motion.button
                    onClick={() => setOpenPin(open ? null : pin.id)}
                    whileHover={reduce ? {} : { x: isAr ? -3 : 3 }}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-start"
                    style={{ ...glassLight, color: INK, outline: open ? `2px solid ${CAMEL}` : "none" }}
                  >
                    <span className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>
                        {pin.products!.brands?.name ?? ""}
                      </span>
                      <span className="text-[14px] font-bold leading-tight">{nameOf(pin)}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-extrabold">
                      {Number(pin.products!.price).toFixed(2)} <span className="text-[10px]">{c.unit}</span>
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>

          {/* total + add */}
          <div className="mt-5 flex items-center justify-between gap-4 rounded-[24px] px-5 py-4" style={glassLight}>
            <span className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "rgba(20,20,20,0.68)" }}>
                {c.total}
              </span>
              <motion.span
                key={total}
                initial={reduce ? undefined : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="text-2xl font-extrabold"
                style={{ color: INK }}
              >
                {total.toFixed(2)} <span className="text-xs font-extrabold">{c.unit}</span>
              </motion.span>
            </span>

            <motion.button
              onClick={addLook}
              whileHover={reduce ? {} : { y: -2 }}
              whileTap={reduce ? {} : { scale: 0.97 }}
              className="flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-extrabold"
              style={{ background: added ? INK : CAMEL, color: added ? "#fff" : INK, boxShadow: "0 12px 26px -14px rgba(20,20,20,0.9)" }}
            >
              {added ? <><Check size={16} strokeWidth={3} /> {c.added}</> : <><ShoppingBag size={16} strokeWidth={2.4} /> {c.add}</>}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
