/** Wardrobe feature — shared categories and item type. */

export const WARDROBE_CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Bags",
  "Accessories",
  "Other",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  image_path: string | null;
  link_url: string | null;
  note: string | null;
  created_at: string;
}
