"use server";

/**
 * Commission-tracking actions.
 * - createInquiry: PUBLIC (customer taps "Enquire") → logs the intro + ref code.
 * - reportInquiry: PUBLIC-by-ref (vendor marks the outcome via their ref link).
 * - updateInquiry / deleteInquiry: studio-admin only (your leads dashboard).
 * All use the service-role client; inquiries have no public RLS policies.
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isStudioAdmin } from "@/lib/spaces";
import { makeRef } from "@/lib/inquiries";

export type InquiryResult = { ok: boolean; error?: string; ref?: string };

export async function createInquiry(formData: FormData): Promise<InquiryResult> {
  const source = String(formData.get("source") ?? "").trim();
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const listingName = String(formData.get("listing_name") ?? "").trim();
  const vendorContact = String(formData.get("vendor_contact") ?? "").trim();
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerContact = String(formData.get("customer_contact") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!customerName) return { ok: false, error: "Please enter your name." };
  if (!customerContact) return { ok: false, error: "Please enter your WhatsApp or email." };
  if (!listingName) return { ok: false, error: "Missing item." };

  const admin = createAdminClient();
  const ref = makeRef();
  const { error } = await admin.from("inquiries").insert({
    ref_code: ref,
    source: source || "fashion",
    listing_id: listingId || null,
    listing_name: listingName,
    vendor_contact: vendorContact || null,
    customer_name: customerName,
    customer_contact: customerContact,
    note: note || null,
  });
  if (error) return { ok: false, error: "Could not record the enquiry. Please try again." };
  return { ok: true, ref };
}

/** Vendor self-report by ref code (the "how you know" mechanism). */
export async function reportInquiry(formData: FormData): Promise<InquiryResult> {
  const ref = String(formData.get("ref") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "").trim(); // 'booked' | 'lost'
  const value = String(formData.get("deal_value") ?? "").trim();
  const reporter = String(formData.get("reported_by") ?? "").trim();
  if (!ref) return { ok: false, error: "Missing reference." };
  if (!["booked", "lost"].includes(outcome)) return { ok: false, error: "Pick an outcome." };

  const admin = createAdminClient();
  const { data: row } = await admin.from("inquiries").select("id").eq("ref_code", ref).single();
  if (!row) return { ok: false, error: "Reference not found." };

  const patch: Record<string, unknown> = {
    status: outcome,
    reported_by: reporter || null,
    booked_at: outcome === "booked" ? new Date().toISOString() : null,
    deal_value: outcome === "booked" && value ? Number(value.replace(/[^\d]/g, "")) || null : null,
  };
  const { error } = await admin.from("inquiries").update(patch).eq("ref_code", ref);
  if (error) return { ok: false, error: "Could not save. Please try again." };
  revalidatePath("/leads");
  return { ok: true };
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isStudioAdmin(user?.email) ? user : null;
}

export async function updateInquiry(formData: FormData): Promise<InquiryResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "").trim();
  const value = String(formData.get("deal_value") ?? "").trim();
  const pct = String(formData.get("commission_pct") ?? "").trim();
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (status === "booked") patch.booked_at = new Date().toISOString();
  patch.deal_value = value ? Number(value.replace(/[^\d]/g, "")) || null : null;
  if (pct) patch.commission_pct = Number(pct) || 0;
  const { error } = await admin.from("inquiries").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}

export async function deleteInquiry(formData: FormData): Promise<InquiryResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  const { error } = await admin.from("inquiries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}
