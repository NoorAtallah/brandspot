"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Truck, Wallet, RotateCcw, type LucideIcon } from "lucide-react";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

type Promise_ = {
  id: string;
  Icon: LucideIcon;
  ar: { t: string; d: string };
  en: { t: string; d: string };
};

const PROMISES: Promise_[] = [
  {
    id: "delivery",
    Icon: Truck,
    ar: {
      t: "توصيل لكل الأردن",
      d: "عمّان خلال ٢٤ ساعة، وباقي المحافظات خلال ٢–٣ أيام عمل.",
    },
    en: {
      t: "Delivery across Jordan",
      d: "Amman within 24 hours, other governorates in 2–3 working days.",
    },
  },
  {
    id: "cod",
    Icon: Wallet,
    ar: {
      t: "الدفع عند الاستلام",
      d: "ادفع نقداً أو عن طريق كليك عند الباب — بدون أي رسوم إضافية.",
    },
    en: {
      t: "Cash on delivery",
      d: "Pay in cash or via CliQ at your door — with no extra fee.",
    },
  },
];

const COPY = {
  ar: {
    eyebrow: "خدمة براند سبوت",
    title: "طلبك بين إيدين أمينة",
    subtitle: "من لحظة الطلب لحدّ ما توصلك القطعة — كل خطوة واضحة ومضمونة.",
  },
  en: {
    eyebrow: "The brand.spot service",
    title: "Your order, in safe hands",
    subtitle:
      "From the moment you order to the moment it arrives — every step is clear and guaranteed.",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Service() {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];

  return (
    <section className="relative w-full px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl"
        >
          <p
            className="text-[11px] font-bold"
            style={{
              color: CAMEL,
              letterSpacing: isAr ? "0.03em" : "0.18em",
              textTransform: isAr ? "none" : "uppercase",
            }}
          >
            {c.eyebrow}
          </p>
          <h2
            className="mt-2 text-3xl font-extrabold md:text-4xl"
            style={{ color: INK, letterSpacing: isAr ? "0" : "-0.025em" }}
          >
            {c.title}
          </h2>
          <p
            className="mt-2.5 text-[15px] leading-relaxed"
            style={{ color: "rgba(20,20,20,0.75)" }}
          >
            {c.subtitle}
          </p>
        </motion.div>

        {/* ── the four promises ── */}
        <div className="mt-9 grid gap-3 sm:grid-cols-2 md:gap-4">
          {PROMISES.map(({ id, Icon, ...copy }, i) => (
            <motion.div
              key={id}
              initial={reduce ? undefined : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                ease,
                delay: Math.min(i * 0.07, 0.3),
              }}
              whileHover={reduce ? {} : { y: -4 }}
              className="rounded-[26px] p-5 md:p-6"
              style={glassLight}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: CAMEL,
                  color: INK,
                  boxShadow: "0 10px 22px -12px rgba(199,167,129,0.9)",
                }}
              >
                <Icon size={20} strokeWidth={2.3} />
              </span>
              <h3
                className="mt-4 text-[16px] font-extrabold"
                style={{ color: INK }}
              >
                {copy[lang].t}
              </h3>
              <p
                className="mt-1.5 text-[13.5px] font-medium leading-relaxed"
                style={{ color: "rgba(20,20,20,0.75)" }}
              >
                {copy[lang].d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
