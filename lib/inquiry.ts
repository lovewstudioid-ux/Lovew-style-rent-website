/**
 * Build a Tally form URL with the signed-in user's details pre-filled, so they
 * don't re-type name/email/phone they already gave the site.
 *
 * Tally reads these from URL query parameters. In the Tally form builder, set
 * each field's "URL parameter" (a.k.a. prefill key) to exactly: name, email, phone.
 * Fields without a matching parameter are simply left blank.
 */
export interface InquiryProfile {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export function inquiryUrl(base: string, p?: InquiryProfile | null): string {
  if (!p) return base;
  const q = new URLSearchParams();
  if (p.name) q.set("name", p.name);
  if (p.email) q.set("email", p.email);
  if (p.phone) q.set("phone", p.phone);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}
