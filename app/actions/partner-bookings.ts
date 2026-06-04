"use server";

/**
 * Partner-side booking state transitions + damage-claim filing.
 *
 * Auth model: each action checks (a) the caller is a partner/admin and
 * (b) the booking's partner_id is owned by the caller. We use the admin
 * client for the writes because the deposit_ledger is service-role-only.
 *
 * State machine the partner drives:
 *   confirmed  → in_use     (markInUse)
 *   in_use     → returned   (markReturned + schedule auto-refund)
 *   returned   → completed  (markCompleted, queues payout)
 *   returned   → disputed   (fileDamageClaim, pauses auto-refund)
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { refundReleaseDate } from "@/lib/deposit";

type Result = { ok: true } | { ok: false; error: string };

async function assertPartnerOwnsBooking(
  bookingId: string,
): Promise<
  | { ok: true; userId: string; bookingPartnerId: string; depositIdr: number; depositStatus: string }
  | { ok: false; error: string }
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
  const role = profile?.role ?? "customer";
  if (role !== "partner" && role !== "admin") {
    return { ok: false, error: "Akses ditolak." };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("partner_id, deposit_idr, deposit_status, partners ( owner_user_id )")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { ok: false, error: "Booking tidak ditemukan." };

  const partner = Array.isArray(booking.partners) ? booking.partners[0] : booking.partners;
  const ownerId = partner?.owner_user_id;
  if (role !== "admin" && ownerId !== user.id) {
    return { ok: false, error: "Bukan booking partner kamu." };
  }

  return {
    ok: true,
    userId: user.id,
    bookingPartnerId: booking.partner_id,
    depositIdr: booking.deposit_idr ?? 0,
    depositStatus: booking.deposit_status ?? "not_required",
  };
}

export async function markBookingInUse(formData: FormData): Promise<Result> {
  const bookingId = String(formData.get("booking_id") ?? "").trim();
  if (!bookingId) return { ok: false, error: "Missing booking_id." };

  const auth = await assertPartnerOwnsBooking(bookingId);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  // Only allow the right state transition.
  const { error } = await admin
    .from("bookings")
    .update({ status: "in_use" })
    .eq("id", bookingId)
    .eq("status", "confirmed");
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/partner/bookings/${bookingId}`);
  revalidatePath("/partner/bookings");
  revalidatePath("/account/bookings");
  return { ok: true };
}

export async function markBookingReturned(formData: FormData): Promise<Result> {
  const bookingId = String(formData.get("booking_id") ?? "").trim();
  if (!bookingId) return { ok: false, error: "Missing booking_id." };

  const auth = await assertPartnerOwnsBooking(bookingId);
  if (!auth.ok) return auth;

  const dueBack = auth.depositIdr > 0 ? refundReleaseDate(new Date()).toISOString() : null;
  const newDepositStatus = auth.depositIdr > 0 ? "refund_pending" : auth.depositStatus;

  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .update({
      status: "returned",
      deposit_due_back_at: dueBack,
      deposit_status: newDepositStatus,
    })
    .eq("id", bookingId)
    .eq("status", "in_use");
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/partner/bookings/${bookingId}`);
  revalidatePath("/partner/bookings");
  revalidatePath("/account/bookings");
  return { ok: true };
}

export async function markBookingCompleted(formData: FormData): Promise<Result> {
  const bookingId = String(formData.get("booking_id") ?? "").trim();
  if (!bookingId) return { ok: false, error: "Missing booking_id." };

  const auth = await assertPartnerOwnsBooking(bookingId);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .eq("status", "returned");
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/partner/bookings/${bookingId}`);
  revalidatePath("/partner/bookings");
  revalidatePath("/account/bookings");
  revalidatePath("/partner/payouts");
  return { ok: true };
}

export async function fileDamageClaim(formData: FormData): Promise<Result> {
  const bookingId = String(formData.get("booking_id") ?? "").trim();
  const amount = Number(formData.get("claimed_idr") ?? 0);
  const reason = String(formData.get("reason") ?? "other").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!bookingId) return { ok: false, error: "Missing booking_id." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Jumlah klaim tidak valid." };
  }
  if (!["stain", "tear", "late_return", "lost", "other"].includes(reason)) {
    return { ok: false, error: "Alasan tidak valid." };
  }

  const auth = await assertPartnerOwnsBooking(bookingId);
  if (!auth.ok) return auth;
  if (amount > auth.depositIdr) {
    return { ok: false, error: "Klaim melebihi deposit." };
  }

  const admin = createAdminClient();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Look up customer id for the claim row.
  const { data: bk } = await admin
    .from("bookings")
    .select("customer_id, status, partner_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!bk) return { ok: false, error: "Booking tidak ditemukan." };
  if (bk.status !== "returned") {
    return { ok: false, error: "Klaim hanya bisa diajukan saat status Dikembalikan." };
  }

  const { error: claimError } = await admin.from("damage_claims").insert({
    booking_id: bookingId,
    partner_id: bk.partner_id,
    customer_id: bk.customer_id,
    claimed_idr: Math.round(amount),
    reason,
    description,
    status: "open",
  });
  if (claimError) return { ok: false, error: claimError.message };

  // Pause refund + flip booking to disputed.
  await admin
    .from("bookings")
    .update({ status: "disputed" })
    .eq("id", bookingId);

  revalidatePath(`/partner/bookings/${bookingId}`);
  revalidatePath("/partner/bookings");
  revalidatePath("/admin/disputes");
  return { ok: true };
}
