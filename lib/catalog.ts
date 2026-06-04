/**
 * Catalog data helpers — thin wrappers around the search_dresses RPC and a
 * few related queries. Keep page components clean by importing from here.
 */

import { createClient } from "@/lib/supabase/server";

export interface SearchParams {
  city?: string | null;
  start?: string | null;
  end?: string | null;
  categories?: string[];
  occasions?: string[];
  colors?: string[];
  size?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  fitsUserId?: string | null;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  limit?: number;
  offset?: number;
}

export interface DressSearchRow {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  daily_price_idr: number;
  deposit_idr: number | null;
  primary_color: string | null;
  category: string;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string;
  partner_id: string;
  partner_slug: string;
  partner_brand: string;
  partner_city: string;
  total_count: number;
}

const CITIES = ["jakarta", "surabaya", "bali", "bandung"];

/** Run the catalog search RPC. Returns an empty array if anything blows up. */
export async function searchDresses(
  params: SearchParams = {},
): Promise<{ rows: DressSearchRow[]; total: number }> {
  const supabase = createClient();
  const cityParam = params.city && CITIES.includes(params.city) ? params.city : null;
  const { data, error } = await supabase.rpc("search_dresses", {
    p_city: cityParam,
    p_start: params.start ?? null,
    p_end: params.end ?? null,
    p_categories: params.categories?.length ? params.categories : null,
    p_occasions: params.occasions?.length ? params.occasions : null,
    p_colors: params.colors?.length ? params.colors : null,
    p_size: params.size ?? null,
    p_min_price: params.minPrice ?? null,
    p_max_price: params.maxPrice ?? null,
    p_fits_user_id: params.fitsUserId ?? null,
    p_sort: params.sort ?? "relevance",
    p_limit: params.limit ?? 24,
    p_offset: params.offset ?? 0,
  });

  if (error) {
    console.error("search_dresses error", error);
    return { rows: [], total: 0 };
  }
  const rows = (data ?? []) as DressSearchRow[];
  return { rows, total: rows[0]?.total_count ?? 0 };
}

/** Fetch the current user's wishlisted dress ids (as a Set for O(1) lookups). */
export async function getWishlistIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const supabase = createClient();
  const { data } = await supabase
    .from("wishlists")
    .select("dress_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.dress_id));
}

/**
 * Read a single dress (active only) by partner slug + dress slug, with all
 * its variants and images. Used by the dress detail page.
 */
export async function getDressBySlug(partnerSlug: string, dressSlug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dresses")
    .select(
      `
      id, partner_id, title, slug, description, designer, category, sub_category,
      occasions, colors, primary_color, style_tags,
      daily_price_idr, retail_price_idr, deposit_idr,
      min_rental_days, max_rental_days,
      cover_image_url, rating_avg, rating_count, status,
      dress_images ( id, url, alt_text, sort_order ),
      dress_variants ( id, size_label, bust_cm, waist_cm, hip_cm, shoulder_cm, length_cm, color, qty_on_hand ),
      partners!inner ( id, brand_name, slug, city, description, logo_url, cover_url, instagram, tiktok, rating_avg, rating_count, status )
    `,
    )
    .eq("slug", dressSlug)
    .eq("partners.slug", partnerSlug)
    .eq("status", "active")
    .eq("partners.status", "active")
    .maybeSingle();
  if (error) return null;
  return data;
}

/** Fetch a partner with their active dresses. Used by partner storefront. */
export async function getPartnerBySlug(partnerSlug: string) {
  const supabase = createClient();
  const { data: partner } = await supabase
    .from("partners")
    .select(
      "id, brand_name, slug, city, address, description, logo_url, cover_url, instagram, tiktok, whatsapp, shipping_available, shipping_cities, rating_avg, rating_count",
    )
    .eq("slug", partnerSlug)
    .eq("status", "active")
    .maybeSingle();
  if (!partner) return null;

  const { data: dresses } = await supabase
    .from("dresses")
    .select(
      "id, slug, title, cover_image_url, daily_price_idr, primary_color, category, rating_avg, rating_count",
    )
    .eq("partner_id", partner.id)
    .eq("status", "active")
    .order("rating_avg", { ascending: false });

  return { partner, dresses: dresses ?? [] };
}

/** Unavailable dates for a variant in a range — for the calendar UI. */
export async function getUnavailableDates(
  variantId: string,
  fromIso: string,
  toIso: string,
): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("variant_unavailable_dates")
    .select("unavail_date")
    .eq("variant_id", variantId)
    .gte("unavail_date", fromIso)
    .lte("unavail_date", toIso);
  return (data ?? []).map((r) => r.unavail_date as string);
}
