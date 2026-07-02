/**
 * GET /api/og-fetch?url=...
 *
 * Fetches Open Graph / meta tags from a product URL so the registry owner
 * can paste a Shopee/Tokopedia/IG/brand link and have name + image + price
 * auto-filled without typing.
 *
 * Works for any page that sets standard OG tags (og:title, og:image,
 * product:price:amount).  Shopee and Tokopedia both do this.  Instagram
 * public posts do too (title = caption, image = post image).
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Grab first match of an OG meta tag in either attribute order. */
function extractMeta(html: string, property: string): string {
  const re1 = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    "i",
  );
  return (html.match(re1) ?? html.match(re2))?.[1]?.trim() ?? "";
}

function extractName(html: string, property: string): string {
  const re1 = new RegExp(
    `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
    "i",
  );
  return (html.match(re1) ?? html.match(re2))?.[1]?.trim() ?? "";
}

function extractTitle(html: string): string {
  return (
    extractMeta(html, "og:title") ||
    extractName(html, "twitter:title") ||
    (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "")
  );
}

/** Clean up escaped/encoded URLs coming from JSON-LD or meta tags. */
function cleanUrl(u: string): string {
  return u.replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
}

/** Product image from JSON-LD — usually the clean product photo (no price card). */
function extractJsonLdImage(html: string): string {
  const m =
    html.match(/"image"\s*:\s*"([^"]+)"/i) ||
    html.match(/"image"\s*:\s*\[\s*"([^"]+)"/i) ||
    html.match(/"image"\s*:\s*\{[^}]*?"url"\s*:\s*"([^"]+)"/i);
  return m ? cleanUrl(m[1]) : "";
}

function extractImage(html: string): string {
  return (
    // Prefer the structured-data product photo — cleaner than share cards
    // (Shopee/marketplace og:image often has the price baked into the picture).
    extractJsonLdImage(html) ||
    cleanUrl(extractMeta(html, "og:image")) ||
    cleanUrl(extractName(html, "twitter:image")) ||
    cleanUrl(extractName(html, "twitter:image:src")) ||
    ""
  );
}

function extractItemprop(html: string, prop: string): string {
  const re1 = new RegExp(`<meta[^>]+itemprop=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']${prop}["']`, "i");
  return (html.match(re1) ?? html.match(re2))?.[1]?.trim() ?? "";
}

function extractCurrency(html: string): string {
  return (
    extractMeta(html, "product:price:currency") ||
    extractMeta(html, "og:price:currency") ||
    extractItemprop(html, "priceCurrency") ||
    html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/)?.[1] ||
    ""
  );
}

function rawPrice(html: string): string {
  return (
    extractMeta(html, "product:price:amount") ||
    extractMeta(html, "og:price:amount") ||
    extractMeta(html, "product:price") ||
    extractMeta(html, "og:price") ||
    extractItemprop(html, "price") ||
    // JSON-LD offers: "price":"250000" or "lowPrice":250000
    html.match(/"(?:price|lowPrice)"\s*:\s*"?([\d]+(?:[.,]\d+)?)"?/i)?.[1] ||
    ""
  );
}

/** Return a display-ready price string, formatting bare numbers by currency. */
function extractPrice(html: string): string {
  const raw = rawPrice(html).trim();
  if (!raw) return "";
  // Already has a currency symbol/word — pass through.
  if (/[^\d.,\s]/.test(raw)) return raw;

  const currency = extractCurrency(html).toUpperCase();
  const n = Number(raw.replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
  if (!Number.isFinite(n)) return raw;

  if (currency === "IDR" || currency === "") {
    // Indonesian Rupiah — thousands separated by dots, no decimals.
    return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
  }
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("en-US")}`;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") ?? "";
  if (!raw) return NextResponse.json({ error: "URL required" }, { status: 400 });

  let url: URL;
  try {
    url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Bad protocol");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Mimic Facebook's link scraper — most shops allow this bot
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });

    const html = await res.text();
    const title = extractTitle(html);
    const image = extractImage(html);
    const price = extractPrice(html);

    if (!title && !image) {
      return NextResponse.json({ error: "No product info found for this URL" }, { status: 422 });
    }

    return NextResponse.json({ title, image, price });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json({ error: `Could not fetch URL: ${msg}` }, { status: 500 });
  }
}
