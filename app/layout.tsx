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
  title: "LOVEW Studio — Style & Spaces",
  description:
    "LOVEW Studio — a creative house. Dress rental & shop, studios & venues, personal styling, photo & video, and digital invitations. Jakarta & Surabaya.",
  applicationName: "LOVEW Studio",
  openGraph: {
    title: "LOVEW Studio — Style & Spaces",
    description:
      "A creative house — wardrobe, studios, styling, production, and digitals.",
    url: brand.urls.product,
    siteName: "LOVEW Studio",
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
