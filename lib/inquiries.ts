/** Commission tracking — shared types & helpers. */

export const INQUIRY_STATUSES = ["new", "contacted", "booked", "lost"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Inquiry {
  id: string;
  ref_code: string;
  created_at: string;
  source: string;
  listing_id: string | null;
  listing_name: string;
  vendor_contact: string | null;
  customer_name: string;
  customer_contact: string | null;
  note: string | null;
  status: string;
  deal_value: number | null;
  commission_pct: number;
  reported_by: string | null;
  booked_at: string | null;
}

/** Short human-friendly reference, e.g. LV-7K3QX. */
export function makeRef(): string {
  return "LV-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function commissionOf(i: Pick<Inquiry, "deal_value" | "commission_pct">): number {
  if (!i.deal_value) return 0;
  return Math.round((i.deal_value * (i.commission_pct ?? 0)) / 100);
}
