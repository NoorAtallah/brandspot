'use client';
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { CAMEL, INK } from "../../lib/glass";
import AddToCart from "./add-to-cart";
import type { CartLine } from "../../lib/cart";

type Variant = { id: string; size: string; stock: number; sort_order: number };

const COPY = {
  ar: { size: "المقاس", age: "العمر", pick: "اختر المقاس", pickAge: "اختر العمر" },
  en: { size: "Size", age: "Age", pick: "Pick a size", pickAge: "Pick an age" },
} as const;

/**
 * Sizes for adults, ages for kids — the same variant rows, labelled by
 * department. A product with no variants sells as a single option and the
 * picker does not appear at all.
 */
export default function ProductActions({
  line, dept, stock, variants,
}: {
  line: Omit<CartLine, "qty" | "size">;
  dept: "women" | "men" | "kids";
  stock: number;
  variants: Variant[];
}) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];
  const isKids = dept === "kids";

  const sorted = [...(variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const [size, setSize] = React.useState<string | null>(null);

  if (!sorted.length) {
    return <AddToCart line={{ ...line, size: null }} stock={stock} compact />;
  }

  const chosen = sorted.find((v) => v.size === size);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "rgba(20,20,20,0.6)" }}>
        {isKids ? c.age : c.size}
      </span>

      <div className="flex flex-wrap justify-center gap-1.5">
        {sorted.map((v) => {
          const soldOut = v.stock <= 0;
          const on = size === v.size;
          return (
            <motion.button
              key={v.id}
              onClick={() => setSize(on ? null : v.size)}
              disabled={soldOut}
              whileTap={reduce || soldOut ? {} : { scale: 0.94 }}
              aria-pressed={on}
              className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold disabled:opacity-40"
              style={{
                background: on ? CAMEL : "rgba(255,255,255,0.75)",
                color: INK,
                border: `1px solid ${on ? CAMEL : "rgba(20,20,20,0.12)"}`,
                textDecoration: soldOut ? "line-through" : "none",
              }}
            >
              {v.size}
            </motion.button>
          );
        })}
      </div>

      <AddToCart
        line={{ ...line, size }}
        stock={size ? chosen?.stock ?? 0 : 0}
        label={size ? undefined : isKids ? c.pickAge : c.pick}
        compact
      />
    </div>
  );
}
