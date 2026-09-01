'use client';
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, Tag, TrendingUp, BadgeDollarSign, Search, RotateCcw, Check, X } from "lucide-react";
import { PageHeader, Panel, Button, Field, Input, Select, Toggle, TableWrap, Empty, muted } from "../../ui";
import { CAMEL, INK, glassLight } from "../../../lib/glass";

/* Front-end only: seed data lives here, nothing is persisted. */
type Item = {
  id: string;
  name: string;
  brand: string;
  dept: "women" | "men" | "kids";
  cost: number;
  price: number;
  was: number | null;
  active: boolean;
};

const SEED: Item[] = [
  { id: "1", name: "Oversized Wool Coat", brand: "Maison Ora", dept: "women", cost: 42, price: 129, was: 159, active: true },
  { id: "2", name: "Silk Slip Dress", brand: "Maison Ora", dept: "women", cost: 28, price: 89, was: null, active: true },
  { id: "3", name: "Linen Camp Shirt", brand: "Norr", dept: "men", cost: 14, price: 45, was: 59, active: true },
  { id: "4", name: "Tailored Trousers", brand: "Norr", dept: "men", cost: 22, price: 69, was: null, active: true },
  { id: "5", name: "Knit Cardigan", brand: "Atelier 9", dept: "women", cost: 19, price: 55, was: null, active: false },
  { id: "6", name: "Cotton Tee 2-Pack", brand: "Atelier 9", dept: "kids", cost: 7, price: 22, was: 28, active: true },
  { id: "7", name: "Denim Jacket", brand: "Rowe", dept: "kids", cost: 16, price: 48, was: null, active: true },
  { id: "8", name: "Leather Belt", brand: "Rowe", dept: "men", cost: 9, price: 32, was: 39, active: true },
];

const money = (n: number) => `${n.toFixed(2)} JOD`;
const marginOf = (i: Item) => (i.price <= 0 ? 0 : ((i.price - i.cost) / i.price) * 100);
const round99 = (n: number) => Math.max(0, Math.floor(n) + 0.99);

function Stat({ Icon, label, value, hint }: { Icon: typeof Tag; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[26px] p-5" style={glassLight}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: CAMEL, color: INK }}>
        <Icon size={18} strokeWidth={2.4} />
      </span>
      <p className="mt-4 text-2xl font-extrabold sm:text-3xl" style={{ color: INK }}>{value}</p>
      <p className="text-[13px] font-bold" style={{ color: muted }}>{label}</p>
      {hint ? <p className="mt-1 text-[11.5px] font-bold" style={{ color: "rgba(20,20,20,0.45)" }}>{hint}</p> : null}
    </div>
  );
}

export default function PricingClient() {
  const [items, setItems] = React.useState<Item[]>(SEED);
  const [q, setQ] = React.useState("");
  const [dept, setDept] = React.useState<"all" | Item["dept"]>("all");
  const [onSaleOnly, setOnSaleOnly] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [mode, setMode] = React.useState<"percent" | "amount" | "set">("percent");
  const [amount, setAmount] = React.useState("10");
  const [charm, setCharm] = React.useState(true);
  const [keepWas, setKeepWas] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const visible = React.useMemo(
    () =>
      items.filter((i) => {
        if (dept !== "all" && i.dept !== dept) return false;
        if (onSaleOnly && !(i.was && i.was > i.price)) return false;
        const t = `${i.name} ${i.brand}`.toLowerCase();
        return t.includes(q.trim().toLowerCase());
      }),
    [items, q, dept, onSaleOnly]
  );

  const stats = React.useMemo(() => {
    const live = items.filter((i) => i.active);
    const avg = live.length ? live.reduce((s, i) => s + i.price, 0) / live.length : 0;
    const margin = live.length ? live.reduce((s, i) => s + marginOf(i), 0) / live.length : 0;
    const onSale = items.filter((i) => i.was && i.was > i.price).length;
    return { avg, margin, onSale, count: live.length };
  }, [items]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((i) => selected.has(i.id));
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allVisibleSelected) visible.forEach((i) => n.delete(i.id));
      else visible.forEach((i) => n.add(i.id));
      return n;
    });

  const editPrice = (id: string, v: string) => {
    const n = Number(v);
    setItems((list) => list.map((i) => (i.id === id ? { ...i, price: Number.isFinite(n) ? n : i.price } : i)));
  };

  const applyBulk = () => {
    const val = Number(amount);
    if (!selected.size || !Number.isFinite(val)) return flash("Pick products and a valid number.");
    setItems((list) =>
      list.map((i) => {
        if (!selected.has(i.id)) return i;
        let next =
          mode === "percent" ? i.price * (1 - val / 100) : mode === "amount" ? i.price - val : val;
        next = Math.max(0, charm ? round99(next) : Math.round(next * 100) / 100);
        const was = keepWas && next < i.price ? i.was ?? i.price : i.was;
        return { ...i, price: next, was };
      })
    );
    flash(`Updated ${selected.size} product${selected.size > 1 ? "s" : ""}.`);
  };

  const clearSale = () => {
    if (!selected.size) return flash("Pick products first.");
    setItems((list) => list.map((i) => (selected.has(i.id) ? { ...i, price: i.was ?? i.price, was: null } : i)));
    flash("Sale prices reverted.");
  };

  const resetAll = () => {
    setItems(SEED);
    setSelected(new Set());
    flash("Reset to seed data.");
  };

  return (
    <>
      <PageHeader
        title="Pricing"
        subtitle="Set prices, run a sale, and watch the margin — front-end preview, nothing is saved."
        action={
          <Button tone="ghost" onClick={resetAll}>
            <RotateCcw size={15} strokeWidth={2.4} />
            Reset
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat Icon={BadgeDollarSign} label="Average price" value={money(stats.avg)} hint={`${stats.count} active`} />
        <Stat Icon={TrendingUp} label="Average margin" value={`${stats.margin.toFixed(1)}%`} />
        <Stat Icon={Percent} label="On sale" value={String(stats.onSale)} hint={`of ${items.length}`} />
        <Stat Icon={Tag} label="Selected" value={String(selected.size)} hint="for bulk edit" />
      </div>

      {/* filters */}
      <Panel className="mt-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative min-w-[220px] flex-1">
            <Field label="Search">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product or brand" />
            </Field>
            <Search size={15} strokeWidth={2.4} className="pointer-events-none absolute bottom-3.5 end-4" style={{ color: muted }} />
          </div>
          <Field label="Department">
            <Select value={dept} onChange={(e) => setDept(e.target.value as typeof dept)}>
              <option value="all">All</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
            </Select>
          </Field>
          <div className="pb-2.5">
            <Toggle on={onSaleOnly} onChange={setOnSaleOnly} label="On sale only" />
          </div>
        </div>
      </Panel>

      {/* bulk bar */}
      <Panel className="mt-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Field label="Rule">
            <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="percent">Discount %</option>
              <option value="amount">Reduce by amount</option>
              <option value="set">Set price to</option>
            </Select>
          </Field>
          <Field label={mode === "percent" ? "Percent" : "Amount (JOD)"}>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          </Field>
          <div className="flex flex-wrap items-center gap-4 pb-2.5">
            <Toggle on={charm} onChange={setCharm} label="Round to .99" />
            <Toggle on={keepWas} onChange={setKeepWas} label="Keep was-price" />
          </div>
          <div className="flex flex-wrap gap-2 sm:ms-auto">
            <Button tone="ghost" onClick={clearSale}>
              <X size={15} strokeWidth={2.4} />
              Clear sale
            </Button>
            <Button tone="camel" onClick={applyBulk}>
              <Check size={15} strokeWidth={2.4} />
              Apply to {selected.size || "—"}
            </Button>
          </div>
        </div>
      </Panel>

      {/* table */}
      <Panel className="mt-3">
        {visible.length === 0 ? (
          <Empty label="No products match these filters." />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[760px] border-collapse text-start">
              <thead>
                <tr className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: muted }}>
                  <th className="px-4 py-3 text-start">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 accent-[#C7A781]" />
                  </th>
                  <th className="px-4 py-3 text-start">Product</th>
                  <th className="px-4 py-3 text-start">Dept</th>
                  <th className="px-4 py-3 text-start">Cost</th>
                  <th className="px-4 py-3 text-start">Price</th>
                  <th className="px-4 py-3 text-start">Was</th>
                  <th className="px-4 py-3 text-start">Margin</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => {
                  const m = marginOf(i);
                  const on = selected.has(i.id);
                  return (
                    <motion.tr
                      key={i.id}
                      layout
                      className="border-t"
                      style={{ borderColor: "rgba(20,20,20,0.06)", background: on ? "rgba(199,167,129,0.16)" : "transparent" }}
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={on} onChange={() => toggle(i.id)} className="h-4 w-4 accent-[#C7A781]" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13.5px] font-extrabold" style={{ color: INK }}>{i.name}</p>
                        <p className="text-[12px] font-bold" style={{ color: muted }}>
                          {i.brand}
                          {i.active ? "" : " · hidden"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold capitalize" style={{ color: muted }}>{i.dept}</td>
                      <td className="px-4 py-3 text-[13px] font-bold" style={{ color: muted }}>{money(i.cost)}</td>
                      <td className="px-4 py-3">
                        <input
                          value={i.price}
                          onChange={(e) => editPrice(i.id, e.target.value)}
                          inputMode="decimal"
                          className="w-24 rounded-xl px-3 py-1.5 text-[13px] font-extrabold outline-none"
                          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(20,20,20,0.10)", color: INK }}
                        />
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold" style={{ color: muted }}>
                        {i.was ? <span className="line-through">{money(i.was)}</span> : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-1 text-[12px] font-extrabold"
                          style={{
                            background: m < 40 ? "rgba(190,40,40,0.12)" : "rgba(199,167,129,0.28)",
                            color: m < 40 ? "#a02020" : INK,
                          }}
                        >
                          {m.toFixed(0)}%
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-extrabold md:bottom-8"
            style={{ background: INK, color: "#fff" }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
