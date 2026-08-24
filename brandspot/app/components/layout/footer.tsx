'use client';
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Phone, MapPin, Wallet, Truck, ArrowUpRight } from "lucide-react";
import { glassLight, CAMEL, INK } from "../../lib/glass";
import { useLang } from "../../lib/i18n";

type Col = { id: string; ar: string; en: string; links: { href: string; ar: string; en: string }[] };

const COLUMNS: Col[] = [
  {
    id: "shop",
    ar: "تسوّق",
    en: "Shop",
    links: [
      { href: "/shop?dept=women", ar: "نساء", en: "Women" },
      { href: "/shop?dept=men", ar: "رجال", en: "Men" },
      { href: "/shop?dept=kids", ar: "أطفال", en: "Kids" },
      { href: "/shop?sort=new", ar: "وصل حديثاً", en: "New in" },
      { href: "/shop?sale=1", ar: "التخفيضات", en: "Sale" },
    ],
  },
  {
    id: "brands",
    ar: "الماركات",
    en: "Brands",
    links: [
      { href: "/brands/zara", ar: "زارا", en: "Zara" },
      { href: "/brands/hm", ar: "إتش آند إم", en: "H&M" },
      { href: "/brands/gap", ar: "غاب", en: "GAP" },
      { href: "/brands/next", ar: "نكست", en: "Next" },
      { href: "/brands", ar: "كل الماركات", en: "All brands" },
    ],
  },
  {
    id: "help",
    ar: "المساعدة",
    en: "Help",
    links: [
      { href: "/shipping", ar: "التوصيل", en: "Delivery" },
      { href: "/returns", ar: "الإرجاع والاستبدال", en: "Returns & exchanges" },
      { href: "/sizes", ar: "دليل المقاسات", en: "Size guide" },
      { href: "/track", ar: "تتبّع طلبك", en: "Track your order" },
      { href: "/contact", ar: "تواصل معنا", en: "Contact us" },
    ],
  },
];

const COPY = {
  ar: {
    blurb: "ماركات عالمية أصلية، تُطلب أونلاين وتوصل لباب بيتك في كل الأردن — والدفع عند الاستلام.",
    cod: "الدفع عند الاستلام",
    delivery: "توصيل لكل الأردن",
    phone: "٠٧٩ ١٢٣ ٤٥٦٧",
    city: "عمّان، الأردن",
    rights: "جميع الحقوق محفوظة",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    follow: "تابعنا",
  },
  en: {
    blurb: "Original global brands, ordered online and delivered to your door anywhere in Jordan — pay when it arrives.",
    cod: "Cash on delivery",
    delivery: "Delivery across Jordan",
    phone: "079 123 4567",
    city: "Amman, Jordan",
    rights: "All rights reserved",
    terms: "Terms & conditions",
    privacy: "Privacy policy",
    follow: "Follow us",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
  const { lang, isAr } = useLang();
  const reduce = useReducedMotion();
  const c = COPY[lang];
  const year = 2026;

  return (
    <footer className="relative mt-auto w-full px-5 pb-24 pt-10 md:pb-10">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease }}
        className="mx-auto max-w-6xl overflow-hidden rounded-[30px] p-7 md:p-10"
        style={glassLight}
      >
        <div className="grid gap-9 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:gap-8">
          {/* brand block */}
          <div>
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight" style={{ color: INK, letterSpacing: "-0.02em" }}>
                brans
              </span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAMEL }} />
              <span className="text-xl font-extrabold tracking-tight" style={{ color: CAMEL, letterSpacing: "-0.02em" }}>
                spot
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-[13.5px] font-medium leading-relaxed" style={{ color: "rgba(20,20,20,0.75)" }}>
              {c.blurb}
            </p>

            <ul className="mt-5 flex flex-col gap-2">
              {[
                { Icon: Wallet, label: c.cod },
                { Icon: Truck, label: c.delivery },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[13px] font-bold" style={{ color: INK }}>
                  <Icon size={16} strokeWidth={2.3} style={{ color: CAMEL }} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.id} aria-label={col[lang]}>
              <h3
                className="text-[11px] font-extrabold"
                style={{ color: CAMEL, letterSpacing: isAr ? "0.03em" : "0.16em", textTransform: isAr ? "none" : "uppercase" }}
              >
                {col[lang]}
              </h3>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-[13.5px] font-bold transition-colors"
                      style={{ color: "rgba(20,20,20,0.78)" }}
                    >
                      <span className="group-hover:underline" style={{ textUnderlineOffset: "3px" }}>
                        {l[lang]}
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: CAMEL, transform: isAr ? "scaleX(-1)" : "none" }}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* contact + social */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6" style={{ borderColor: "rgba(20,20,20,0.08)" }}>
          <a href="tel:+962791234567" className="flex items-center gap-2 text-[13.5px] font-bold" style={{ color: INK }} dir="ltr">
            <Phone size={16} strokeWidth={2.3} style={{ color: CAMEL }} />
            {c.phone}
          </a>
          <span className="flex items-center gap-2 text-[13.5px] font-bold" style={{ color: "rgba(20,20,20,0.78)" }}>
            <MapPin size={16} strokeWidth={2.3} style={{ color: CAMEL }} />
            {c.city}
          </span>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-extrabold"
            style={{ ...glassLight, color: INK, marginInlineStart: "auto" }}
          >
            <Camera size={15} strokeWidth={2.3} style={{ color: CAMEL }} />
            {c.follow}
          </a>
        </div>

        {/* legal */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[12.5px] font-bold" style={{ color: "rgba(20,20,20,0.65)" }}>
          <span>
            © {year} brand.spot — {c.rights}
          </span>
          <span className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline" style={{ textUnderlineOffset: "3px" }}>
              {c.terms}
            </Link>
            <Link href="/privacy" className="hover:underline" style={{ textUnderlineOffset: "3px" }}>
              {c.privacy}
            </Link>
          </span>
        </div>
      </motion.div>
    </footer>
  );
}
