/** Shared dropdown options — reused across sign-up, style profile, vendor forms
 *  so city/country/sizes are always consistent and connected. */

export const GENDERS = ["Female", "Male", "Prefer not to say", "Other"] as const;

export const COUNTRIES = [
  "Indonesia", "Malaysia", "Singapore", "Philippines", "Thailand", "Vietnam",
  "Australia", "Japan", "South Korea", "United States", "United Kingdom", "Other",
] as const;

/** Major Indonesian cities (most common for this audience) + Other. */
export const CITIES = [
  "Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi", "Bandung", "Bandung Barat",
  "Semarang", "Yogyakarta", "Surakarta (Solo)", "Surabaya", "Malang", "Sidoarjo",
  "Denpasar", "Medan", "Makassar", "Palembang", "Pekanbaru", "Batam", "Balikpapan",
  "Other",
] as const;

export const TOP_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

/**
 * Pants waist sizes — US waist measurement in inches (the most widely used
 * international numbering system, also standard on Indonesian fashion labels).
 * Equivalent EU size = waist number × 2 + 8  (e.g. W28 ≈ EU 44).
 */
export const PANTS_SIZES = [
  "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36",
  "37", "38", "39", "40", "42", "44",
] as const;

/** EU shoe sizes (standard in Indonesia). */
export const SHOE_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] as const;

export const BIRTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
export const BIRTH_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const BIRTH_YEARS = Array.from({ length: 70 }, (_, i) => String(new Date().getFullYear() - 13 - i));
