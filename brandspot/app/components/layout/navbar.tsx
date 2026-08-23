'use client';
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Home, ShoppingBag, Tag, Search, Globe } from "lucide-react";
import { glass, CAMEL, INK, PAPER } from "../../lib/glass";
import { useLang } from "../../lib/i18n";
import { useCart } from "../../lib/cart";

type Tone = "dark" | "light";

/**
 * A cash-on-delivery shop has no accounts and no wishlist, so the bar is just
 * browse + bag. The bag is a button, not a link: it opens the cart drawer.
 */
export default function Nav({ tone = "dark" }: { tone?: Tone }) {
  const { t, lang, setLang } = useLang();
  const { count, setOpen } = useCart();
  const reduce = useReducedMotion();

  const text = tone === "dark" ? INK : "#fff";
  const shadow = tone === "light" ? "0 1px 10px rgba(0,0,0,0.55)" : "none";

  const links = [
    { href: "/", label: t.nav.shop, Icon: Home },
    { href: "/#brands", label: t.nav.brands, Icon: Tag },
  ];

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  const BagButton = ({ compact = false }: { compact?: boolean }) => (
    <motion.button
      onClick={() => setOpen(true)}
      whileTap={reduce ? {} : { scale: 0.94 }}
      className={`relative flex items-center gap-2 rounded-full font-extrabold ${compact ? "h-11 w-11 justify-center" : "px-4 h-10 text-sm"}`}
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
      {/* mobile: floating language toggle + bag */}
      <div className="fixed top-4 z-40 flex items-center gap-2 md:hidden" style={{ insetInlineEnd: "1rem" }}>
        <motion.button
          onClick={toggleLang}
          whileTap={reduce ? {} : { scale: 0.92 }}
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ ...glass, color: text }}
          aria-label="Switch language"
        >
          <Globe size={17} strokeWidth={2.2} />
        </motion.button>
        <BagButton compact />
      </div>

      {/* desktop top bar */}
      <header className="fixed top-0 inset-x-0 z-30 hidden px-4 pt-6 md:block">
        <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-[22px] px-3 py-2" style={glass}>
          <Link href="/" className="flex items-center gap-1.5" style={{ paddingInlineStart: "0.75rem" }}>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: text, letterSpacing: "-0.02em", textShadow: shadow }}>brans</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAMEL }} />
            <span className="text-lg font-extrabold tracking-tight" style={{ color: CAMEL, letterSpacing: "-0.02em", textShadow: shadow }}>spot</span>
          </Link>

          <ul className="flex items-center gap-1">
            {links.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold"
                  style={{ color: text, textShadow: shadow }}
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
              style={{ ...glass, color: text }}
              aria-label="Switch language"
            >
              <Globe size={16} strokeWidth={2.2} />
              <span className="text-xs font-extrabold" style={{ textShadow: shadow }}>{t.toggle}</span>
            </motion.button>

            <motion.button
              whileHover={reduce ? {} : { scale: 1.06 }}
              whileTap={reduce ? {} : { scale: 0.92 }}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ ...glass, color: text }}
              aria-label={t.nav.search}
            >
              <Search size={17} strokeWidth={2.2} />
            </motion.button>

            <BagButton />
          </div>
        </nav>
      </header>

      {/* mobile bottom bar */}
      <nav className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 md:hidden" style={{ width: "min(92%, 430px)" }}>
        <ul className="flex items-stretch justify-between rounded-[26px] px-2 py-2" style={glass}>
          {links.map(({ href, label, Icon }) => (
            <li key={href} className="flex-1">
              <Link href={href} className="flex w-full flex-col items-center gap-1 rounded-2xl py-2">
                <Icon size={21} strokeWidth={2.3} color={text} />
                <span className="text-[10.5px] font-extrabold" style={{ color: text, textShadow: shadow }}>{label}</span>
              </Link>
            </li>
          ))}

          <li className="flex-1">
            <button onClick={() => setOpen(true)} className="relative flex w-full flex-col items-center gap-1 rounded-2xl py-2">
              <ShoppingBag size={21} strokeWidth={2.4} color={text} />
              <span className="text-[10.5px] font-extrabold" style={{ color: text, textShadow: shadow }}>{t.nav.bag}</span>
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
