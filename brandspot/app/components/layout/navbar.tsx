'use client';
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Home, ShoppingBag, Tag, Search, Globe, X } from "lucide-react";
import { CAMEL, INK, PAPER } from "../../lib/glass";
import { useLang } from "../../lib/i18n";
import { useCart } from "../../lib/cart";

/**
 * Solid, not glass. The bar sits over photography as often as over paper, and
 * a translucent bar over a busy hero was unreadable — so it is an opaque
 * surface with ink text everywhere.
 */
const bar: React.CSSProperties = {
  background: PAPER,
  border: "1px solid rgba(20,20,20,0.08)",
  boxShadow: "0 10px 30px -12px rgba(20,20,20,0.35)",
};

const control: React.CSSProperties = {
  background: "rgba(20,20,20,0.05)",
  border: "1px solid rgba(20,20,20,0.08)",
  color: INK,
};

export default function Nav() {
  const { t, lang, setLang } = useLang();
  const { count, setOpen } = useCart();
  const reduce = useReducedMotion();
  const router = useRouter();

  const [searching, setSearching] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  /** The shop page owns the results; the bar only hands it a query. */
  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setSearching(false);
    setTerm("");
  };

  const searchControl = (compact = false) => (
    <AnimatePresence initial={false} mode="wait">
      {searching ? (
        <motion.form
          key="field"
          onSubmit={runSearch}
          initial={reduce ? undefined : { width: 40, opacity: 0 }}
          animate={{ width: compact ? 200 : 220, opacity: 1 }}
          exit={reduce ? undefined : { width: 40, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-10 items-center gap-2 overflow-hidden rounded-full px-3.5"
          style={control}
        >
          <Search size={16} strokeWidth={2.4} style={{ color: CAMEL }} />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onBlur={() => { if (!term) setSearching(false); }}
            onKeyDown={(e) => e.key === "Escape" && setSearching(false)}
            placeholder={t.nav.search}
            className="min-w-0 flex-1 bg-transparent text-[13px] font-bold outline-none"
            style={{ color: INK }}
          />
          <button type="button" onClick={() => { setTerm(""); setSearching(false); }} aria-label="Close search" style={{ color: "rgba(20,20,20,0.5)" }}>
            <X size={14} strokeWidth={3} />
          </button>
        </motion.form>
      ) : (
        <motion.button
          key="button"
          onClick={() => setSearching(true)}
          whileHover={reduce ? {} : { scale: 1.06 }}
          whileTap={reduce ? {} : { scale: 0.92 }}
          className={`flex items-center justify-center rounded-full ${compact ? "h-11 w-11" : "h-10 w-10"}`}
          style={compact ? bar : control}
          aria-label={t.nav.search}
        >
          <Search size={17} strokeWidth={2.2} color={INK} />
        </motion.button>
      )}
    </AnimatePresence>
  );

  const links = [
    { href: "/shop", label: t.nav.shop, Icon: Home },
    { href: "/brands", label: t.nav.brands, Icon: Tag },
  ];

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  const bagButton = (compact = false) => (
    <motion.button
      onClick={() => setOpen(true)}
      whileTap={reduce ? {} : { scale: 0.94 }}
      className={`relative flex items-center gap-2 rounded-full font-extrabold ${compact ? "h-11 w-11 justify-center" : "h-10 px-4 text-sm"}`}
      style={{ background: CAMEL, color: INK }}
      aria-label={t.nav.bag}
    >
      <ShoppingBag size={17} strokeWidth={2.4} />
      {!compact && <span>{t.nav.bag}</span>}
      {count > 0 ? (
        <motion.span
          key={count}
          initial={reduce ? undefined : { scale: 0.6 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
          style={{ background: INK, color: PAPER, insetInlineEnd: "-0.25rem" }}
        >
          {count}
        </motion.span>
      ) : null}
    </motion.button>
  );

  return (
    <>
      {/* mobile: language + bag, floating */}
      <div className="fixed top-4 z-40 flex items-center gap-2 md:hidden" style={{ insetInlineEnd: "1rem" }}>
        <motion.button
          onClick={toggleLang}
          whileTap={reduce ? {} : { scale: 0.92 }}
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={bar}
          aria-label="Switch language"
        >
          <Globe size={17} strokeWidth={2.2} color={INK} />
        </motion.button>
        {searchControl(true)}
        {bagButton(true)}
      </div>

      {/* desktop top bar */}
      <header className="fixed inset-x-0 top-0 z-30 hidden px-4 pt-5 md:block">
        <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-[20px] px-3 py-2" style={bar}>
          <Link href="/" className="flex items-center gap-1.5" style={{ paddingInlineStart: "0.75rem" }}>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: INK, letterSpacing: "-0.02em" }}>brans</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAMEL }} />
            <span className="text-lg font-extrabold tracking-tight" style={{ color: CAMEL, letterSpacing: "-0.02em" }}>spot</span>
          </Link>

          <ul className="flex items-center gap-1">
            {links.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[rgba(20,20,20,0.05)]"
                  style={{ color: INK }}
                >
                  <Icon size={17} strokeWidth={2.4} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5" style={{ marginInlineEnd: "0.25rem" }}>
            <motion.button
              onClick={toggleLang}
              whileTap={reduce ? {} : { scale: 0.92 }}
              className="flex h-10 items-center gap-1.5 rounded-full px-3.5"
              style={control}
              aria-label="Switch language"
            >
              <Globe size={16} strokeWidth={2.2} />
              <span className="text-xs font-extrabold">{t.toggle}</span>
            </motion.button>

            {searchControl()}

            {bagButton()}
          </div>
        </nav>
      </header>

      {/* mobile bottom bar */}
      <nav className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 md:hidden" style={{ width: "min(92%, 430px)" }}>
        <ul className="flex items-stretch justify-between rounded-[24px] px-2 py-2" style={bar}>
          {links.map(({ href, label, Icon }) => (
            <li key={href} className="flex-1">
              <Link href={href} className="flex w-full flex-col items-center gap-1 rounded-2xl py-2">
                <Icon size={21} strokeWidth={2.3} color={INK} />
                <span className="text-[10.5px] font-extrabold" style={{ color: INK }}>{label}</span>
              </Link>
            </li>
          ))}

          <li className="flex-1">
            <button onClick={() => setOpen(true)} className="relative flex w-full flex-col items-center gap-1 rounded-2xl py-2">
              <ShoppingBag size={21} strokeWidth={2.4} color={INK} />
              <span className="text-[10.5px] font-extrabold" style={{ color: INK }}>{t.nav.bag}</span>
              {count > 0 ? (
                <span className="absolute top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
                  style={{ background: CAMEL, color: INK, insetInlineEnd: "1.1rem" }}>
                  {count}
                </span>
              ) : null}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
