'use client';
import { LanguageProvider } from "./lib/i18n";
import { GlassFilter, Ambient } from "./lib/glass";
import { CartProvider } from "./lib/cart";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider defaultLang="ar">
      <GlassFilter />
      <Ambient />
      <CartProvider>{children}</CartProvider>
    </LanguageProvider>
  );
}