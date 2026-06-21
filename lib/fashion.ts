/** LOVEW Fashion (lighter) — shared types & options. Reuses helpers from lib/spaces. */

export const FASHION_CATEGORIES = ["Gown", "Dress", "Kebaya", "Suit", "Set", "Outerwear", "Accessory", "Other"] as const;
export const LISTING_TYPES = ["Rent", "Buy", "Rent & Buy"] as const;

export interface FashionListing {
  id: string;
  created_at: string;
  status: string;
  name: string;
  category: string;
  listing_type: string;
  size: string | null;
  price: string | null;
  city: string | null;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  image_urls: string[];
  cover_url: string | null;
}
