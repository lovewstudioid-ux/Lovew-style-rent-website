/**
 * Single source of truth for brand strings, URLs, and palette.
 * Import from here — never duplicate brand copy or hex values in components.
 *
 * LOVEW Style is one product of the parent brand LOVEW Studio. A sibling
 * product (LOVEW Spaces) is added later, so keep product-specific logic
 * modular and never assume Style is the only product.
 */

export const brand = {
  /** This product. Use this exact name in UI, titles, metadata, emails. */
  product: "LOVEW Style",
  /** Parent brand — always two words, "Studio" capitalised. */
  parent: "LOVEW Studio",

  taglines: {
    /** Parent brand tagline. */
    parent: "Style & Spaces for the moments that matter.",
    /** This product's tagline. */
    style: "Rent the look. Own the moment.",
  },

  urls: {
    /** This site's live domain. */
    product: "https://lovew.studio",
    /** Parent brand home (same domain for now). */
    parent: "https://lovew.studio",
  },

  /**
   * Palette — the LOVEW house colours from the brand book. These mirror the CSS
   * variables in app/globals.css. Prefer the Tailwind tokens (bg-wine,
   * text-ink, …) in components; this map exists for the rare non-Tailwind
   * context (e.g. emails, OG images).
   */
  colors: {
    wine: "#4C0B19",
    wineDeep: "#3A0812",
    plum: "#6B1D2B",
    chiffon: "#F6F4E9",
    pearl: "#E5DDCF",
    bone: "#EDE6D6",
    eucalyptus: "#938A65",
    oliveShadow: "#4D3B2E",
    ink: "#231A16",
  },

  /** Cities the marketplace launches in. */
  cities: ["Jakarta", "Surabaya", "Bali", "Bandung"] as const,

  social: {
    instagram: "https://instagram.com/lovewstudio",
    whatsapp: "https://wa.me/6281353752257",
  },
} as const;

export type City = (typeof brand.cities)[number];
