'use client';
import { LanguageProvider } from "./lib/i18n";
import { GlassFilter } from "./lib/glass";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider defaultLang="ar">
      <GlassFilter />
      {children}
    </LanguageProvider>
  );
}