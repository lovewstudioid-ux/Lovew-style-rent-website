import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.urls.product),
  title: {
    default: `${brand.product} — ${brand.taglines.style}`,
    template: `%s · ${brand.product}`,
  },
  description:
    "Rent the look. Own the moment. LOVEW Style is a curated dress & fashion rental marketplace — discover, reserve, and rent looks from independent providers across Jakarta, Surabaya, Bali, and Bandung, with a refundable deposit held safely.",
  applicationName: brand.product,
  openGraph: {
    title: `${brand.product} — ${brand.taglines.style}`,
    description: "Rent the look. Own the moment.",
    url: brand.urls.product,
    siteName: brand.product,
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
