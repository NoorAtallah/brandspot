'use client';
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useCart, type CartLine } from "../../lib/cart";
import { useLang } from "../../lib/i18n";
import { CAMEL, INK } from "../../lib/glass";

const COPY = {
  ar: { add: "أضف للحقيبة", added: "تمت الإضافة", out: "غير متوفر" },
  en: { add: "Add to bag", added: "Added", out: "Out of stock" },
} as const;

export default function AddToCart({
  line, stock = 1, compact = false, label,
}: {
  line: Omit<CartLine, "qty">;
  stock?: number;
  compact?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const [done, setDone] = React.useState(false);
  const soldOut = stock <= 0;

  const click = () => {
    if (soldOut) return;
    add(line);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };

  return (
    <motion.button
      onClick={click}
      disabled={soldOut}
      whileTap={reduce || soldOut ? {} : { scale: 0.96 }}
      className={`flex items-center justify-center gap-2 rounded-full font-extrabold disabled:opacity-60 ${
        compact ? "px-4 py-2.5 text-[12.5px]" : "px-6 py-3.5 text-[13px]"
      }`}
      style={{ background: soldOut ? "rgba(20,20,20,0.12)" : done ? INK : CAMEL, color: done ? "#fff" : INK }}
    >
      {soldOut ? c.out : done ? <><Check size={15} strokeWidth={3} /> {c.added}</> : <><ShoppingBag size={15} strokeWidth={2.4} /> {label ?? c.add}</>}
    </motion.button>
  );
}
