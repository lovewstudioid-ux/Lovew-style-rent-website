/** Gift registry — shared types, categories, slug helper. */

export const REGISTRY_CATEGORIES = [
  "Fashion",
  "Beauty",
  "Home",
  "Tech",
  "Books",
  "Experiences",
  "Other",
] as const;

export interface Registry {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  event_date: string | null;
  note: string | null;
  shipping_address: string | null;
  show_address: boolean;
  created_at: string;
}

export interface RegistryItem {
  id: string;
  registry_id: string;
  name: string;
  category: string;
  image_url: string | null;
  image_path: string | null;
  link_url: string | null;
  price: string | null;
  note: string | null;
  reserved_by_name: string | null;
  reserved_by_email: string | null;
  reserved_at: string | null;
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
