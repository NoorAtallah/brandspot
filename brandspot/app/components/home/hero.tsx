'use client';
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { glass, CAMEL, PAPER, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

/* Swap for your own photo. Using next/image? add images.unsplash.com to
   next.config.ts remotePatterns, then replace <img> with <Image fill />. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1611708314849-8bb91fe0fa56?q=80&w=2670&auto=format&fit=crop";

const ageKeys = ["baby", "girls", "boys"] as const;

export default function Hero() {
  const { t, isAr } = useLang();
  const reduce = useReducedMotion();

  // scrim darkens the side the card sits on (inline-start): left in EN, right in AR
  const cardScrim = `linear-gradient(${isAr ? "270deg" : "90deg"}, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.15) 42%, transparent 70%)`;

  return (
    <section className="relative min-h-screen w-full overflow-hidden" style={{ background: "#9c7e56" }}>
      {/* full-bleed image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 30%" }} />

      {/* scrims */}
      <div className="absolute inset-0" style={{ background: cardScrim }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,20,20,0.35), transparent 22%, transparent 78%, rgba(20,20,20,0.3))" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(199,167,129,0.22), transparent 55%)" }} />

      {/* hero card — sits at inline-start (right in AR, left in EN) */}
      <div className="relative z-20 mx-auto max-w-6xl min-h-screen px-5 flex items-end md:items-center pb-32 md:pb-0 pt-28">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:max-w-lg rounded-[30px] p-7 md:p-9"
          style={{ ...glass, background: "rgba(255,255,255,0.16)" }}
        >
          <p className="text-[11px] font-bold text-white/85"
            style={{ letterSpacing: isAr ? "0.05em" : "0.2em", textTransform: isAr ? "none" : "uppercase" }}>
            {t.eyebrow}
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-white"
            style={{ lineHeight: 1.05, letterSpacing: isAr ? "0" : "-0.03em", textShadow: "0 2px 18px rgba(0,0,0,0.35)" }}>
            {t.title.pre}{" "}<span style={{ color: CAMEL }}>{t.title.accent}</span>{" "}{t.title.post}
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-white/85">{t.subtitle}</p>

          {/* shop by age — main action */}
          <p className="mt-7 text-[11px] font-bold text-white/70"
            style={{ letterSpacing: isAr ? "0.03em" : "0.18em", textTransform: isAr ? "none" : "uppercase" }}>
            {t.shopByAge}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {ageKeys.map((k) => (
              <motion.button
                key={k}
                whileHover={reduce ? {} : { y: -3 }}
                whileTap={reduce ? {} : { scale: 0.96 }}
                className="rounded-2xl px-3 py-3.5 text-start"
                style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(4px)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-white">{t.ages[k].label}</span>
                  <ArrowUpRight size={15} style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }} />
                </div>
                <span className="text-[11px] font-semibold text-white/70">{t.ages[k].hint}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-full px-6 py-3 text-sm font-bold" style={{ background: PAPER, color: INK }}>
              {t.cta1}
            </button>
            <button className="text-sm font-bold text-white">
              {t.cta2} {isAr ? "←" : "→"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}