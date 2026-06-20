/** Spaces vendor listings — shared types, options, admin check. */

export const SPACE_TYPES = ["Studio", "Indoor", "Outdoor", "Villa", "Rooftop", "Café", "Other"] as const;

export interface SpaceListing {
  id: string;
  created_at: string;
  status: string;
  name: string;
  space_type: string;
  city: string | null;
  area: string | null;
  price_from: string | null;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  image_urls: string[];
  cover_url: string | null;
}

/** Emails allowed to review & publish listings (studio owner). */
export function isStudioAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.STUDIO_ADMIN_EMAILS ?? "lovewstudioid@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

/** Normalise an Instagram handle/url to just the handle (no @, no url). */
export function igHandle(input: string | null | undefined): string | null {
  if (!input) return null;
  const h = input.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/+$/, "");
  return h || null;
}

/** Normalise a WhatsApp number to digits with country code (Indonesia default). */
export function waNumber(input: string | null | undefined): string | null {
  if (!input) return null;
  let d = input.replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return d || null;
}
