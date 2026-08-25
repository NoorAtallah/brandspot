'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";
export type Dir = "rtl" | "ltr";

type DeptItem = { label: string; hint: string };
type Dict = {
  eyebrow: string;
  title: { pre: string; accent: string; post: string };
  subtitle: string;
  shopBy: string;
  depts: { women: DeptItem; men: DeptItem; kids: DeptItem };
  cta1: string;
  cta2: string;
  nav: { shop: string; brands: string; bag: string; search: string };
  toggle: string;
};

const DICT: Record<Lang, Dict> = {
  ar: {
    eyebrow: "ماركات عالمية · الأردن",
    title: { pre: "ماركات", accent: "أصلية", post: "للعائلة كلها." },
    subtitle: "  للنساء والرجال والأطفال، مُختارة بعناية وتوصَّل إلى أي مكان في الأردن.",
    shopBy: "تسوّق حسب القسم",
    depts: {
      women: { label: "نساء", hint: "وصل حديثاً" },
      men: { label: "رجال", hint: "وصل حديثاً" },
      kids: { label: "أطفال", hint: "0–15 سنة" },
    },
    cta1: "تسوّق الجديد",
    cta2: "تصفّح الماركات",
    nav: { shop: "تسوّق", brands: "الماركات", bag: "الحقيبة", search: "بحث" },
    toggle: "EN",
  },
  en: {
    eyebrow: "Original brands · Jordan",
    title: { pre: "Original brands for", accent: "everyone", post: "you dress." },
    subtitle: "Zara, H&M, GAP & Next — for women, men and kids, hand-picked and delivered anywhere in Jordan.",
    shopBy: "Shop by department",
    depts: {
      women: { label: "Women", hint: "New in" },
      men: { label: "Men", hint: "New in" },
      kids: { label: "Kids", hint: "0–15 yrs" },
    },
    cta1: "Shop new arrivals",
    cta2: "Browse brands",
    nav: { shop: "Shop", brands: "Brands", bag: "Bag", search: "Search" },
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