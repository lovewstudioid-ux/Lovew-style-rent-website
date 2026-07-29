/**
 * Build Tally form URLs with the signed-in user's details pre-filled, so they
 * don't re-type what they already gave the site.
 *
 * IMPORTANT: Tally only applies these when each form field is configured to
 * accept a URL-parameter prefill in the Tally builder. Configure the fields
 * with these exact (lowercase) parameter keys:
 *   name · nickname · email · whatsapp · instagram
 *   height · bust · waist · hips · size · shoes
 * Unconfigured parameters are simply ignored — passing them is always safe.
 */
export interface InquiryProfile {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

/** Append any non-empty params to a base URL. */
export function prefillUrl(base: string, params: Record<string, string | null | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const val = (v ?? "").trim();
    if (val) q.set(k, val);
  }
  const s = q.toString();
  return s ? `${base}${base.includes("?") ? "&" : "?"}${s}` : base;
}

export function inquiryUrl(base: string, p?: InquiryProfile | null): string {
  if (!p) return base;
  return prefillUrl(base, { name: p.name, email: p.email, whatsapp: p.phone });
}
