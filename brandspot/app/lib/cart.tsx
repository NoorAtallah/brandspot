'use client';
import * as React from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name_ar: string;
  name_en: string;
  brand: string | null;
  price: number;
  image: string | null;
  size: string | null;
  qty: number;
};

type CartContext = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (productId: string, size: string | null, qty: number) => void;
  remove: (productId: string, size: string | null) => void;
  clear: () => void;
};

const Ctx = React.createContext<CartContext | null>(null);
const KEY = "brandspot.cart.v1";

/** Same product in two sizes is two lines. */
const same = (l: CartLine, id: string, size: string | null) => l.productId === id && l.size === size;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [open, setOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Read once on mount rather than during render, so the server and the first
  // client paint agree and React does not complain about a hydration mismatch.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // corrupt or unavailable storage: start empty
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // private mode or full quota: the cart simply will not survive a reload
    }
  }, [lines, ready]);

  const add: CartContext["add"] = (line, qty = 1) => {
    setLines((prev) => {
      const at = prev.findIndex((l) => same(l, line.productId, line.size));
      if (at === -1) return [...prev, { ...line, qty }];
      const copy = [...prev];
      copy[at] = { ...copy[at]!, qty: copy[at]!.qty + qty };
      return copy;
    });
    setOpen(true);
  };

  const setQty: CartContext["setQty"] = (productId, size, qty) =>
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !same(l, productId, size))
        : prev.map((l) => (same(l, productId, size) ? { ...l, qty } : l))
    );

  const remove: CartContext["remove"] = (productId, size) =>
    setLines((prev) => prev.filter((l) => !same(l, productId, size)));

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);

  return (
    <Ctx.Provider value={{ lines, count, subtotal, open, setOpen, add, setQty, remove, clear: () => setLines([]) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartContext {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
