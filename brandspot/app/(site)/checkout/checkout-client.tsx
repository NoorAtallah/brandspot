'use client';
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Wallet, Truck, LoaderCircle, ArrowUpRight } from "lucide-react";
import { useCart } from "../../lib/cart";
import { useLang } from "../../lib/i18n";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { placeOrder } from "./actions";

type Zone = { id: string; city_ar: string; city_en: string; fee: number; eta_ar: string | null; eta_en: string | null };

const COPY = {
  ar: {
    title: "إتمام الطلب", subtitle: "الدفع عند الاستلام — بدون بطاقة وبدون حساب.",
    name: "الاسم الكامل", phone: "رقم الهاتف", city: "المدينة", address: "العنوان بالتفصيل",
    notes: "ملاحظات للسائق (اختياري)", pick: "اختر المدينة",
    summary: "ملخّص الطلب", subtotal: "المجموع", delivery: "التوصيل", total: "الإجمالي",
    submit: "أكّد الطلب", sending: "جارِ الإرسال…", unit: "د.أ", empty: "حقيبتك فاضية.",
    browse: "تصفّح الجديد", cod: "الدفع عند الاستلام", free: "مجاناً",
    errors: {
      missing_fields: "يرجى تعبئة كل الحقول المطلوبة.",
      empty_cart: "حقيبتك فاضية.",
      unavailable: "إحدى القطع لم تعد متوفرة.",
      out_of_stock: "الكمية المطلوبة غير متوفرة.",
      lookup_failed: "تعذّر التحقق من الطلب، حاول مرة أخرى.",
      insert_failed: "تعذّر حفظ الطلب، حاول مرة أخرى.",
    },
  },
  en: {
    title: "Checkout", subtitle: "Cash on delivery — no card, no account.",
    name: "Full name", phone: "Phone number", city: "City", address: "Full address",
    notes: "Notes for the driver (optional)", pick: "Choose your city",
    summary: "Order summary", subtotal: "Subtotal", delivery: "Delivery", total: "Total",
    submit: "Place order", sending: "Placing…", unit: "JD", empty: "Your bag is empty.",
    browse: "Browse new arrivals", cod: "Cash on delivery", free: "Free",
    errors: {
      missing_fields: "Please fill in every required field.",
      empty_cart: "Your bag is empty.",
      unavailable: "One of the pieces is no longer available.",
      out_of_stock: "We do not have that many in stock.",
      lookup_failed: "We could not verify the order — try again.",
      insert_failed: "We could not save the order — try again.",
    },
  },
} as const;

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(20,20,20,0.10)",
  color: INK,
};

export default function CheckoutClient({ zones }: { zones: Zone[] }) {
  const { lines, subtotal, clear } = useCart();
  const { lang, isAr } = useLang();
  const router = useRouter();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  const [form, setForm] = React.useState({ name: "", phone: "", city: "", address: "", notes: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const zone = zones.find((z) => (isAr ? z.city_ar : z.city_en) === form.city);
  const fee = Number(zone?.fee ?? 0);
  const total = subtotal + fee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await placeOrder({
      customer_name: form.name,
      phone: form.phone,
      city: form.city,
      address: form.address,
      notes: form.notes,
      lines: lines.map((l) => ({ productId: l.productId, size: l.size, qty: l.qty })),
    });

    if ("error" in res && res.error) {
      const key = res.error as keyof typeof c.errors;
      setError(c.errors[key] ?? c.errors.insert_failed);
      setBusy(false);
      return;
    }

    clear();
    router.push(`/order/${res.orderNumber}`);
  };

  if (!lines.length) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 pt-28 text-center">
        <p className="text-[16px] font-bold" style={{ color: "rgba(20,20,20,0.72)" }}>{c.empty}</p>
        <Link href="/" className="rounded-full px-6 py-3 text-[13px] font-extrabold" style={{ background: CAMEL, color: INK }}>
          {c.browse}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-28 md:pt-32">
      <h1 className="text-3xl font-extrabold md:text-4xl" style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}>{c.title}</h1>
      <p className="mt-2 text-[15px] font-medium" style={{ color: "rgba(20,20,20,0.72)" }}>{c.subtitle}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr] md:gap-6">
        {/* ── details ── */}
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-[30px] p-6 md:p-8" style={glassLight}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "rgba(20,20,20,0.65)" }}>{c.name}</span>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="rounded-2xl px-4 py-3 text-[14px] font-bold outline-none" style={inputStyle} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "rgba(20,20,20,0.65)" }}>{c.phone}</span>
            <input required type="tel" inputMode="tel" dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="079 123 4567"
              className="rounded-2xl px-4 py-3 text-[14px] font-bold outline-none" style={inputStyle} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "rgba(20,20,20,0.65)" }}>{c.city}</span>
            <select required value={form.city} onChange={(e) => set("city", e.target.value)}
              className="rounded-2xl px-4 py-3 text-[14px] font-bold outline-none" style={inputStyle}>
              <option value="">{c.pick}</option>
              {zones.map((z) => (
                <option key={z.id} value={isAr ? z.city_ar : z.city_en}>
                  {isAr ? z.city_ar : z.city_en} — {Number(z.fee) === 0 ? c.free : `${Number(z.fee).toFixed(2)} ${c.unit}`}
                </option>
              ))}
            </select>
            {zone ? (
              <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "rgba(20,20,20,0.62)" }}>
                <Truck size={14} strokeWidth={2.3} style={{ color: CAMEL }} />
                {isAr ? zone.eta_ar : zone.eta_en}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "rgba(20,20,20,0.65)" }}>{c.address}</span>
            <textarea required rows={3} value={form.address} onChange={(e) => set("address", e.target.value)}
              className="rounded-2xl px-4 py-3 text-[14px] font-medium outline-none" style={inputStyle} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "rgba(20,20,20,0.65)" }}>{c.notes}</span>
            <input value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="rounded-2xl px-4 py-3 text-[14px] font-medium outline-none" style={inputStyle} />
          </label>

          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-bold" style={{ background: "rgba(199,167,129,0.18)", color: INK }}>
            <Wallet size={17} strokeWidth={2.3} style={{ color: CAMEL }} />
            {c.cod}
          </div>

          {error ? (
            <p className="rounded-2xl px-4 py-3 text-[13px] font-bold" style={{ background: "rgba(190,40,40,0.10)", color: "#a02020" }}>{error}</p>
          ) : null}

          <motion.button
            type="submit"
            disabled={busy}
            whileTap={reduce || busy ? {} : { scale: 0.98 }}
            className="mt-1 flex items-center justify-center gap-2 rounded-full py-4 text-[14px] font-extrabold disabled:opacity-70"
            style={{ background: INK, color: "#fff" }}
          >
            {busy ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} className="flex">
                <LoaderCircle size={17} strokeWidth={2.6} />
              </motion.span>
            ) : null}
            {busy ? c.sending : `${c.submit} · ${total.toFixed(2)} ${c.unit}`}
          </motion.button>
        </form>

        {/* ── summary ── */}
        <aside className="h-max rounded-[30px] p-6 md:sticky md:top-28" style={glassLight}>
          <h2 className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "rgba(20,20,20,0.65)" }}>{c.summary}</h2>

          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((l) => (
              <li key={`${l.productId}-${l.size ?? "-"}`} className="flex items-center gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl" style={{ background: "rgba(20,20,20,0.06)" }}>
                  {l.image ? <Image src={l.image} alt="" fill sizes="56px" className="object-cover" /> : null}
                  <span className="absolute bottom-0 end-0 rounded-tl-lg px-1.5 text-[10px] font-extrabold" style={{ background: CAMEL, color: INK }}>
                    {l.qty}
                  </span>
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold" style={{ color: INK }}>{isAr ? l.name_ar : l.name_en}</span>
                  {l.brand ? <span className="block text-[11px] font-extrabold" style={{ color: CAMEL }}>{l.brand}</span> : null}
                </span>
                <span className="text-[13.5px] font-extrabold" style={{ color: INK }}>{(l.price * l.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 flex flex-col gap-2 pt-4 text-[13.5px] font-bold" style={{ borderTop: "1px solid rgba(20,20,20,0.08)", color: "rgba(20,20,20,0.72)" }}>
            <div className="flex justify-between"><dt>{c.subtotal}</dt><dd>{subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between">
              <dt>{c.delivery}</dt>
              <dd>{form.city ? (fee === 0 ? c.free : fee.toFixed(2)) : "—"}</dd>
            </div>
            <div className="mt-1 flex justify-between text-[18px] font-extrabold" style={{ color: INK }}>
              <dt>{c.total}</dt><dd>{total.toFixed(2)} <span className="text-[11px]">{c.unit}</span></dd>
            </div>
          </dl>

          <Link href="/" className="mt-5 flex items-center justify-center gap-1.5 text-[12.5px] font-extrabold" style={{ color: "rgba(20,20,20,0.7)" }}>
            {c.browse}
            <ArrowUpRight size={14} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
