/** Gift registry — shared types, currencies, slug + price helpers. */

/** Currencies the owner can pick from. `symbol` is shown next to the amount. */
export const CURRENCIES = [
  { code: "IDR", symbol: "Rp", label: "IDR (Rp)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "SGD", symbol: "S$", label: "SGD (S$)" },
  { code: "MYR", symbol: "RM", label: "MYR (RM)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" },
] as const;

export function currencySymbol(code: string | null): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "";
}

/** Display a price with its currency symbol, e.g. "Rp 250.000" or "$25". */
export function formatPrice(price: string | null, currency: string | null): string {
  if (!price) return "";
  const p = price.trim();
  if (!p) return "";
  // If the stored value already contains a currency symbol/word, show as-is.
  if (/[^\d.,\s]/.test(p)) return p;
  const sym = currencySymbol(currency);
  return sym ? `${sym} ${p}` : p;
}

/** Digits-only numeric value from a free-text amount (e.g. "Rp 2.500.000" → 2500000). */
export function parseAmount(v: string | number | null | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Format a numeric amount with its currency symbol, e.g. 2500000 → "Rp 2.500.000". */
export function formatAmount(n: number, currency: string | null): string {
  const sym = currencySymbol(currency) || "Rp";
  return `${sym} ${Math.round(n).toLocaleString("id-ID")}`;
}

export interface Registry {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  event_date: string | null;
  note: string | null;
  shipping_address: string | null;
  show_address: boolean;
  payment_note: string | null;
  created_at: string;
}

export interface Contribution {
  id: string;
  item_id: string;
  contributor_name: string;
  amount: number;
  paid: boolean;
  created_at: string;
}

export interface RegistryCategory {
  id: string;
  registry_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
}

export interface RegistryItem {
  id: string;
  registry_id: string;
  name: string;
  category: string;
  category_id: string | null;
  image_url: string | null;
  image_path: string | null;
  link_url: string | null;
  price: string | null;
  currency: string | null;
  qty: number;
  size: string | null;
  color: string | null;
  is_priority: boolean;
  is_group: boolean;
  group_organizer: string | null;
  group_payment: string | null;
  note: string | null;
  reserved_by_name: string | null;
  reserved_by_email: string | null;
  reserved_at: string | null;
  purchased: boolean;
  created_at: string;
}

export interface AddressRequest {
  id: string;
  registry_id: string;
  guest_name: string;
  guest_email: string | null;
  message: string | null;
  created_at: string;
}

/** URL-safe slug from a title plus a short random suffix for uniqueness. */
export function makeSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40) || "registry";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
