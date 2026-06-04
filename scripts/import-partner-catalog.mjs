#!/usr/bin/env node
/**
 * LOVEW Style — partner catalog bulk importer
 * ------------------------------------------------------------------
 * Turns a partner's filled catalog (CSV exported from the "Partner Catalog"
 * Google Sheet) plus a small partner JSON into rows in Supabase:
 *   • one `partners` row
 *   • many `dresses` rows (created as status='draft' so nothing goes live
 *     until photos are uploaded to Cloudinary and you've reviewed them)
 *
 * SAFE BY DEFAULT: runs as a DRY RUN and just prints what it would insert.
 * Add --commit to actually write to Supabase.
 *
 * USAGE
 *   node scripts/import-partner-catalog.mjs \
 *     --partner partner.json \
 *     --catalog "Atelier Mawar - Catalog.csv" \
 *     [--commit]
 *
 * REQUIRES (only when --commit): env vars
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * partner.json shape (from the onboarding Form / Business tab):
 * {
 *   "owner_user_id": "uuid-of-the-partner's-account",  // they sign up first
 *   "brand_name": "Atelier Mawar",
 *   "description": "Studio couture in Jakarta Selatan.",
 *   "city": "jakarta",
 *   "address": "Jl. Wijaya II No. 12, Kebayoran Baru",
 *   "whatsapp": "6281234567890",
 *   "instagram": "https://instagram.com/ateliermawar",
 *   "pickup_available": true,
 *   "shipping_available": true,
 *   "shipping_cities": ["jakarta"],
 *   "commission_pct": 15
 * }
 *
 * NOTE: Confirm against the live schema before first real import —
 *   - `category` / `city` may be enums (dress|gown|kebaya|suit, jakarta|…)
 *   - size variants live in a separate table; wire them in the marked TODO
 *   - `cover_image_url` is set after photos are uploaded to Cloudinary
 */

import { readFileSync } from "node:fs";

// ---------- tiny arg parser ----------
const args = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const COMMIT = args.includes("--commit");
const partnerPath = opt("partner");
const catalogPath = opt("catalog");

if (!partnerPath || !catalogPath) {
  console.error("Usage: node scripts/import-partner-catalog.mjs --partner partner.json --catalog catalog.csv [--commit]");
  process.exit(1);
}

// ---------- helpers ----------
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const toInt = (s) => {
  const n = parseInt(String(s ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

const splitList = (s) =>
  String(s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// Minimal RFC-4180-ish CSV parser (handles quotes, commas, newlines in quotes).
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* ignore */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// Map a catalog row (keyed by our known column ORDER) to a dress record.
// Column order matches the Catalog sheet / template.
const COLS = [
  "item_id", "title", "designer", "category", "sub_category", "occasions",
  "primary_color", "other_colors", "sizes", "measurements",
  "daily_price", "deposit", "retail_price", "min_days", "max_days",
  "condition", "description", "photos",
];

function rowToDress(cells, partnerId) {
  const r = Object.fromEntries(COLS.map((k, i) => [k, (cells[i] ?? "").trim()]));
  const colors = [r.primary_color, ...splitList(r.other_colors)].filter(Boolean);
  return {
    _item_id: r.item_id,
    _sizes: splitList(r.sizes),          // → size variants (see TODO)
    _photos: splitList(r.photos),        // → upload to Cloudinary, then cover_image_url
    record: {
      partner_id: partnerId,
      title: r.title,
      slug: slugify(r.title),
      description: r.description || null,
      designer: r.designer || null,
      category: r.category.toLowerCase(),               // enum: dress|gown|kebaya|suit
      sub_category: r.sub_category || null,
      occasions: splitList(r.occasions).map((o) => o.toLowerCase()),
      colors: colors.map((c) => c.toLowerCase()),
      primary_color: (r.primary_color || "").toLowerCase() || null,
      style_tags: [],
      daily_price_idr: toInt(r.daily_price),
      retail_price_idr: toInt(r.retail_price),
      deposit_idr: toInt(r.deposit),
      min_rental_days: toInt(r.min_days) ?? 1,
      max_rental_days: toInt(r.max_days) ?? 4,
      cover_image_url: null, // set after Cloudinary upload
      status: "draft",       // never auto-publish
    },
  };
}

// ---------- load inputs ----------
const partner = JSON.parse(readFileSync(partnerPath, "utf8"));
const partnerRecord = {
  owner_user_id: partner.owner_user_id ?? null,
  brand_name: partner.brand_name,
  slug: slugify(partner.brand_name),
  description: partner.description ?? null,
  city: (partner.city ?? "jakarta").toLowerCase(),
  address: partner.address ?? null,
  whatsapp: partner.whatsapp ?? null,
  instagram: partner.instagram ?? null,
  pickup_available: partner.pickup_available ?? true,
  shipping_available: partner.shipping_available ?? false,
  shipping_cities: (partner.shipping_cities ?? []).map((c) => c.toLowerCase()),
  commission_pct: partner.commission_pct ?? 15,
  status: "active",
};

const rows = parseCSV(readFileSync(catalogPath, "utf8"));
const header = rows.shift(); // discard header row
const dresses = rows
  .map((cells) => rowToDress(cells, "<partner_id>"))
  .filter((d) => d.record.title && !/example/i.test(d.record.description || "")); // skip the sample row

// ---------- report ----------
console.log(`\nPartner:  ${partnerRecord.brand_name}  (slug: ${partnerRecord.slug}, city: ${partnerRecord.city})`);
console.log(`Catalog:  ${dresses.length} dresses parsed from ${catalogPath}`);
console.log(`Header columns detected: ${header.length}`);
for (const d of dresses) {
  console.log(
    `  • ${d._item_id?.padEnd(6)} ${d.record.title}  [${d.record.category}] ` +
    `Rp${(d.record.daily_price_idr ?? 0).toLocaleString("id-ID")}/day  ` +
    `dep Rp${(d.record.deposit_idr ?? 0).toLocaleString("id-ID")}  ` +
    `sizes:${d._sizes.join("/") || "?"}  photos:${d._photos.length}`
  );
}

if (!COMMIT) {
  console.log(`\nDRY RUN — nothing written. Re-run with --commit (and Supabase env set) to import.\n`);
  process.exit(0);
}

// ---------- commit to Supabase ----------
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}
const { createClient } = await import("@supabase/supabase-js");
const db = createClient(url, key, { auth: { persistSession: false } });

// upsert partner by slug
const { data: p, error: pe } = await db
  .from("partners")
  .upsert(partnerRecord, { onConflict: "slug" })
  .select("id")
  .single();
if (pe) { console.error("Partner upsert failed:", pe.message); process.exit(1); }
console.log(`\nPartner id: ${p.id}`);

// insert dresses
const payload = dresses.map((d) => ({ ...d.record, partner_id: p.id }));
const { data: inserted, error: de } = await db
  .from("dresses")
  .upsert(payload, { onConflict: "partner_id,slug" })
  .select("id, slug");
if (de) { console.error("Dress upsert failed:", de.message); process.exit(1); }
console.log(`Imported ${inserted.length} dresses (status=draft).`);

// TODO (confirm variants table schema, then enable):
//   For each dress, create one variant per size in d._sizes:
//     await db.from("dress_variants").insert(
//       d._sizes.map((size) => ({ dress_id: id, size_label: size, quantity: 1, status: "active" }))
//     );
// TODO: after uploading d._photos to Cloudinary, set dresses.cover_image_url and publish (status='active').

console.log("\nNext: upload photos to Cloudinary, set cover_image_url, review, then flip status to 'active'.\n");
