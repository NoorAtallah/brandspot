'use client';
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../../lib/cart";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK, PAPER } from "../../lib/glass";

const COPY = {
  ar: {
    title: "حقيبتك", empty: "حقيبتك فاضية.", browse: "تصفّح الجديد",
    subtotal: "المجموع", checkout: "إتمام الطلب", unit: "د.أ",
    note: "الدفع عند الاستلام · رسوم التوصيل تُحسب حسب المدينة",
  },
  en: {
    title: "Your bag", empty: "Your bag is empty.", browse: "Browse new arrivals",
    subtotal: "Subtotal", checkout: "Checkout", unit: "JD",
    note: "Cash on delivery · delivery fee is added by city",
  },
} as const;

export default function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQty, remove } = useCart();
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  React.useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [setOpen]);

  // Stop the page scrolling behind the panel.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex" style={{ justifyContent: isAr ? "flex-start" : "flex-end" }}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: isAr ? "-100%" : "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: isAr ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="relative flex h-full w-full max-w-md flex-col"
            style={{ background: PAPER }}
            aria-label={c.title}
          >
            <header className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(20,20,20,0.08)" }}>
              <h2 className="flex items-center gap-2 text-lg font-extrabold" style={{ color: INK }}>
                <ShoppingBag size={19} strokeWidth={2.4} style={{ color: CAMEL }} />
                {c.title}
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2" style={{ color: INK }}>
                <X size={18} strokeWidth={2.6} />
              </button>
            </header>

            {lines.length ? (
              <>
                <ul className="flex-1 overflow-y-auto px-5 py-4">
                  {lines.map((l) => (
                    <motion.li
                      key={`${l.productId}-${l.size ?? "-"}`}
                      layout={!reduce}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 flex gap-3 rounded-[22px] p-3"
                      style={glassLight}
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl" style={{ background: "rgba(20,20,20,0.06)" }}>
                        {l.image ? <Image src={l.image} alt="" fill sizes="80px" className="object-cover" /> : null}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        {l.brand ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: CAMEL }}>{l.brand}</span>
                        ) : null}
                        <span className="truncate text-[14px] font-bold" style={{ color: INK }}>
                          {isAr ? l.name_ar : l.name_en}
                        </span>
                        {l.size ? (
                          <span className="text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.62)" }}>{l.size}</span>
                        ) : null}

                        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: "rgba(255,255,255,0.9)" }}>
                            <button onClick={() => setQty(l.productId, l.size, l.qty - 1)} aria-label="Decrease" className="rounded-full p-1.5" style={{ color: INK }}>
                              <Minus size={13} strokeWidth={3} />
                            </button>
                            <span className="min-w-5 text-center text-[13px] font-extrabold" style={{ color: INK }}>{l.qty}</span>
                            <button onClick={() => setQty(l.productId, l.size, l.qty + 1)} aria-label="Increase" className="rounded-full p-1.5" style={{ color: INK }}>
                              <Plus size={13} strokeWidth={3} />
                            </button>
                          </div>

                          <span className="flex items-center gap-2">
                            <span className="text-[14px] font-extrabold" style={{ color: INK }}>
                              {(l.price * l.qty).toFixed(2)} <span className="text-[10px]">{c.unit}</span>
                            </span>
                            <button onClick={() => remove(l.productId, l.size)} aria-label="Remove" className="p-1" style={{ color: "#a02020" }}>
                              <Trash2 size={14} strokeWidth={2.4} />
                            </button>
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <footer className="px-5 pb-6 pt-4" style={{ borderTop: "1px solid rgba(20,20,20,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold uppercase tracking-wider" style={{ color: "rgba(20,20,20,0.65)" }}>{c.subtotal}</span>
                    <span className="text-2xl font-extrabold" style={{ color: INK }}>
                      {subtotal.toFixed(2)} <span className="text-xs">{c.unit}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.6)" }}>{c.note}</p>

                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-4 flex w-full items-center justify-center rounded-full py-4 text-[14px] font-extrabold"
                    style={{ background: INK, color: "#fff" }}
                  >
                    {c.checkout}
                  </Link>
                </footer>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="text-[15px] font-bold" style={{ color: "rgba(20,20,20,0.7)" }}>{c.empty}</p>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-6 py-3 text-[13px] font-extrabold"
                  style={{ background: CAMEL, color: INK }}
                >
                  {c.browse}
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
