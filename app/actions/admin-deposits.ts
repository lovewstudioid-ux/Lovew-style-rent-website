"use server";

/**
 * Admin-only actions that move money out of escrow:
 *   - markDepositRefunded — record a customer-side refund (admin transferred
 *     manually from the escrow account, then clicks this).
 *   - resolveDamageClaim — approve N rupiah to the partner and refund the rest
 *     to the customer; or reject the claim and refund the full held balance.
 *
 * Every movement writes a deposit_ledger row. The deposit balance MUST match
 * (deposit_held_idr − deposit_refunded_idr − deposit_withheld_idr) at all
 * times — that's the reconciliation invariant on /admin/deposits.
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { ok: false, error: "Akses ditolak." };
  return { ok: true, userId: user.id };
}

export async function markDepositRefunded(formData: FormData): Promise<Result> {
  const bookingId = String(formData.get("booking_id") ?? "").trim();
  if (!bookingId) return { ok: false, error: "Missing booking_id." };

  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, deposit_held_idr, deposit_refunded_idr, deposit_withheld_idr, deposit_status",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { ok: false, error: "Booking tidak ditemukan." };

  const remaining =
    (booking.deposit_held_idr ?? 0) -
    (booking.deposit_refunded_idr ?? 0) -
    (booking.deposit_withheld_idr ?? 0);
  if (remaining <= 0) return { ok: false, error: "Tidak ada sisa deposit untuk di-refund." };

  // Insert ledger entry.
  await admin.from("deposit_ledger").insert({
    booking_id: bookingId,
    entry_type: "refund_to_customer",
    amount_idr: remaining,
    reason: "manual refund by admin",
    created_by: auth.userId,
  });

  // Update booking columns.
  await admin
    .from("bookings")
    .update({
      deposit_refunded_idr: (booking.deposit_refunded_idr ?? 0) + remaining,
      deposit_status: "refunded",
    })
    .eq("id", bookingId);

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/deposits");
  revalidatePath("/account/bookings");
  return { ok: true };
}

export async function resolveDamageClaim(formData: FormData): Promise<Result> {
  const claimId = String(formData.get("claim_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim(); // 'approve' | 'reject'
  const approvedRaw = String(formData.get("approved_idr") ?? "").trim();
  const note = String(formData.get("resolution_note") ?? "").trim() || null;

  if (!claimId) return { ok: false, error: "Missing claim_id." };
  if (decision !== "approve" && decision !== "reject") {
    return { ok: false, error: "Decision invalid." };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: claim } = await admin
    .from("damage_claims")
    .select(
      "id, status, booking_id, claimed_idr, partner_id, bookings ( deposit_held_idr, deposit_refunded_idr, deposit_withheld_idr )",
    )
    .eq("id", claimId)
    .maybeSingle();
  if (!claim) return { ok: false, error: "Klaim tidak ditemukan." };
  if (claim.status !== "open") return { ok: false, error: "Klaim sudah ditutup." };

  const bk = Array.isArray(claim.bookings) ? claim.bookings[0] : claim.bookings;
  const held = bk?.deposit_held_idr ?? 0;
  const refunded = bk?.deposit_refunded_idr ?? 0;
  const withheld = bk?.deposit_withheld_idr ?? 0;
  const available = held - refunded - withheld;
  if (available <= 0) return { ok: false, error: "Tidak ada sisa deposit." };

  let approved = 0;
  if (decision === "approve") {
    approved = Number(approvedRaw);
    if (!Number.isFinite(approved) || approved <= 0) {
      return { ok: false, error: "Jumlah disetujui tidak valid." };
    }
    if (approved > available) {
      return { ok: false, error: "Jumlah disetujui melebihi sisa deposit." };
    }
  }

  const remainder = available - approved;

  // Ledger entries.
  if (approved > 0) {
    await admin.from("deposit_ledger").insert({
      booking_id: claim.booking_id,
      entry_type: "payout_to_partner",
      amount_idr: approved,
      reason: `damage claim approved: ${note ?? ""}`.trim(),
      created_by: auth.userId,
    });
  }
  if (remainder > 0) {
    await admin.from("deposit_ledger").insert({
      booking_id: claim.booking_id,
      entry_type: "refund_to_customer",
      amount_idr: remainder,
      reason:
        decision === "approve" ? "remainder after approved claim" : "claim rejected",
      created_by: auth.userId,
    });
  }

  // Determine the new deposit_status.
  const newDepositStatus =
    approved === 0
      ? "refunded"
      : approved === available
        ? "forfeited"
        : "partially_withheld";

  await admin
    .from("bookings")
    .update({
      deposit_withheld_idr: withheld + approved,
      deposit_refunded_idr: refunded + remainder,
      deposit_status: newDepositStatus,
      status: "completed",
    })
    .eq("id", claim.booking_id);

  await admin
    .from("damage_claims")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      approved_idr: approved,
      resolution_note: note,
      resolved_by: auth.userId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/bookings/${claim.booking_id}`);
  revalidatePath("/partner/bookings");
  revalidatePath("/account/bookings");
  return { ok: true };
}
