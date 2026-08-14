'use client';
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Home, ShoppingBag, Heart, User, Search, Globe, type LucideIcon } from "lucide-react";
import { glass, CAMEL, PAPER, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

type Tone = "dark" | "light";
type NavKey = "shop" | "wishlist" | "bag" | "account" | "search" | "saved" | "you";
type Item = { id: string; key: NavKey; icon: LucideIcon; badge?: number };

const items: Item[] = [
  { id: "shop", key: "shop", icon: Home },
  { id: "wishlist", key: "wishlist", icon: Heart },
  { id: "bag", key: "bag", icon: ShoppingBag, badge: 2 },
  { id: "account", key: "account", icon: User },
];
const mobileItems: Item[] = [
  { id: "shop", key: "shop", icon: Home },
  { id: "search", key: "search", icon: Search },
  { id: "wishlist", key: "saved", icon: Heart },
  { id: "bag", key: "bag", icon: ShoppingBag, badge: 2 },
  { id: "account", key: "you", icon: User },
];

export default function Nav({ tone = "dark" }: { tone?: Tone }) {
  const { t, lang, setLang } = useLang();
  const [active, setActive] = useState("shop");
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 400, damping: 32 };
  const text = tone === "dark" ? INK : "#fff";
  const dim = tone === "dark" ? "rgba(20,20,20,0.6)" : "rgba(255,255,255,0.75)";

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  const LangToggle = ({ compact = false }: { compact?: boolean }) => (
    <motion.button
      onClick={toggleLang}
      whileTap={reduce ? {} : { scale: 0.92 }}
      className={`flex items-center gap-1.5 rounded-full ${compact ? "h-10 w-10 justify-center" : "px-3.5 h-10"}`}
      style={{ ...glass, color: text }}
      aria-label="Switch language"
    >
      <Globe size={16} strokeWidth={2} />
      {!compact && <span className="text-xs font-bold">{t.toggle}</span>}
    </motion.button>
  );

  return (
    <>
      {/* mobile floating language toggle (no top bar on mobile) */}
      <div className="md:hidden fixed top-4 z-40" style={{ insetInlineEnd: "1rem" }}>
        <LangToggle />
      </div>

      {/* desktop top bar */}
      <header className="fixed top-0 inset-x-0 z-30 px-4 pt-6 hidden md:block">
        <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-[22px] px-3 py-2" style={glass}>
          <div className="flex items-center gap-1.5" style={{ paddingInlineStart: "0.75rem" }}>
            <span className="text-lg font-bold tracking-tight" style={{ color: text, letterSpacing: "-0.02em" }}>brans</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAMEL }} />
            <span className="text-lg font-bold tracking-tight" style={{ color: CAMEL, letterSpacing: "-0.02em" }}>spot</span>
          </div>

          <ul className="relative flex items-center gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const on = active === item.id;
              return (
                <li key={item.id} className="relative">
                  <motion.button
                    onClick={() => setActive(item.id)}
                    whileTap={reduce ? {} : { scale: 0.94 }}
                    className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                    style={{ color: on ? INK : dim }}
                  >
                    {on && <motion.span layoutId="nav-desk" className="absolute inset-0 rounded-full" style={{ background: CAMEL }} transition={spring} />}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={17} strokeWidth={2} />
                      <span>{t.nav[item.key]}</span>
                      {item.badge && (
                        <span className="h-4 min-w-4 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center"
                          style={{ background: INK, color: PAPER, marginInlineStart: "0.125rem" }}>{item.badge}</span>
                      )}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5" style={{ marginInlineEnd: "0.25rem" }}>
            <LangToggle />
            <motion.button
              whileHover={reduce ? {} : { scale: 1.06 }}
              whileTap={reduce ? {} : { scale: 0.92 }}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ ...glass, color: text }}
              aria-label={t.nav.search}
            >
              <Search size={17} strokeWidth={2} />
            </motion.button>
          </div>
        </nav>
      </header>

      {/* mobile bottom app bar */}
      <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30" style={{ width: "min(92%, 430px)" }}>
        <ul className="flex items-stretch justify-between rounded-[26px] px-2 py-2" style={glass}>
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const on = active === item.id;
            return (
              <li key={item.id} className="relative flex-1">
                <motion.button
                  onClick={() => setActive(item.id)}
                  whileTap={reduce ? {} : { scale: 0.9 }}
                  className="relative w-full flex flex-col items-center gap-1 py-2 rounded-2xl"
                >
                  {on && <motion.span layoutId="nav-mob" className="absolute inset-0.5 rounded-2xl" style={{ background: "rgba(199,167,129,0.92)" }} transition={spring} />}
                  <span className="relative z-10">
                    <Icon size={21} strokeWidth={on ? 2.4 : 2} color={on ? INK : text} style={{ opacity: on ? 1 : 0.85 }} />
                    {item.badge && (
                      <span className="absolute -top-1.5 h-4 min-w-4 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center"
                        style={{ background: INK, color: PAPER, insetInlineEnd: "-0.5rem" }}>{item.badge}</span>
                    )}
                  </span>
                  <span className="relative z-10 text-[10px] font-bold" style={{ color: on ? INK : text, opacity: on ? 1 : 0.85 }}>{t.nav[item.key]}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}