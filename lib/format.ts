/**
 * Display formatters. Money is stored as integer rupiah (no decimals);
 * dates are stored as ISO / date columns. These helpers are display-only —
 * never round money for storage here.
 */

/**
 * Format integer rupiah as "Rp 250.000" (dot thousands separator).
 * Input is whole rupiah; any fractional input is rounded to the nearest rupiah.
 */
export function formatIDR(amount: number): string {
  const rupiah = Math.round(amount);
  const sign = rupiah < 0 ? "-" : "";
  // de-DE uses "." as the thousands separator, matching IDR convention.
  const grouped = new Intl.NumberFormat("de-DE").format(Math.abs(rupiah));
  return `${sign}Rp ${grouped}`;
}

/**
 * Format a date as "21 May 2026" (dd MMM yyyy).
 * Accepts a Date or an ISO date string ("2026-05-21"). Formatting is pinned to
 * UTC so an ISO date never shifts a day across timezones.
 */
export function formatDate(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
