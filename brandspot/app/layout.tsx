import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const tajawal = Tajawal({ variable: "--font-tajawal", subsets: ["arabic", "latin"], weight: ["400", "500", "700", "800"] });

export const metadata: Metadata = { title: "brans.spot", description: "Original brands for women, men & kids — Jordan" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${geistSans.variable} ${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}