'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";
export type Dir = "rtl" | "ltr";

type AgeItem = { label: string; hint: string };
type Dict = {
  eyebrow: string;
  title: { pre: string; accent: string; post: string };
  subtitle: string;
  shopByAge: string;
  ages: { baby: AgeItem; girls: AgeItem; boys: AgeItem };
  cta1: string;
  cta2: string;
  nav: {
    shop: string; wishlist: string; bag: string; account: string;
    search: string; saved: string; you: string;
  };
  toggle: string;
};

const DICT: Record<Lang, Dict> = {
  ar: {
    eyebrow: "ماركات أطفال · الأردن",
    title: { pre: "ملابس", accent: "مختارة", post: "لأصغر الصغار." },
    subtitle: "ماركات أصلية من زارا و H&M وكارترز — مُختارة لكل عمر، وتوصَّل إلى أي مكان في الأردن.",
    shopByAge: "تسوّق حسب العمر",
    ages: {
      baby: { label: "رُضّع", hint: "0–2 سنة" },
      girls: { label: "بنات", hint: "2–8 سنوات" },
      boys: { label: "أولاد", hint: "2–8 سنوات" },
    },
    cta1: "تسوّق الجديد",
    cta2: "تصفّح الماركات",
    nav: { shop: "تسوّق", wishlist: "المفضّلة", bag: "الحقيبة", account: "حسابي", search: "بحث", saved: "المحفوظة", you: "حسابي" },
    toggle: "EN",
  },
  en: {
    eyebrow: "Kids' brands · Jordan",
    title: { pre: "Considered clothes for", accent: "little", post: "people." },
    subtitle: "Original Zara, H&M & Carter's — hand-picked for every age and delivered anywhere in Jordan.",
    shopByAge: "Shop by age",
    ages: {
      baby: { label: "Baby", hint: "0–2 yrs" },
      girls: { label: "Girls", hint: "2–8 yrs" },
      boys: { label: "Boys", hint: "2–8 yrs" },
    },
    cta1: "Shop new arrivals",
    cta2: "Browse brands",
    nav: { shop: "Shop", wishlist: "Wishlist", bag: "Bag", account: "Account", search: "Search", saved: "Saved", you: "You" },
    toggle: "عربي",
  },
};

type LangContext = {
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
  dir: Dir;
  isAr: boolean;
  t: Dict;
};

const Ctx = createContext<LangContext | null>(null);

export function LanguageProvider({ children, defaultLang = "ar" }: { children: ReactNode; defaultLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const dir: Dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <Ctx.Provider value={{ lang, setLang, dir, isAr: lang === "ar", t: DICT[lang] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LangContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}