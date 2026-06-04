"use server";

/**
 * Booking server actions. createBooking wraps the create_booking_tx Postgres
 * function so the booking row + variant_unavailable_dates inserts are atomic.
 * confirmBookingPayment is admin-only and wraps confirm_booking_payment.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const FULFILLMENT = new Set(["pickup", "shipping"]);
const CITIES = new Set(["jakarta", "surabaya", "bali", "bandung"]);

function asCity(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return CITIES.has(v) ? v : null;
}

export async function createBooking(
  formData: FormData,
): Promise<{ ok: false; error: string } | never> {
  const variantId = String(formData.get("variant_id") ?? "").trim();
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const fulfillmentRaw = String(formData.get("fulfillment") ?? "pickup").trim();
  const fulfillment = FULFILLMENT.has(fulfillmentRaw) ? fulfillmentRaw : "pickup";
  const shippingAddress = String(formData.get("shipping_address") ?? "").trim() || null;
  const shippingCity = asCity(String(formData.get("shipping_city") ?? "") || null);
  const shippingFee = Number(formData.get("shipping_fee_idr") ?? 0) || 0;
  const customerNotes = String(formData.get("customer_notes") ?? "").trim() || null;
  const agreement = formData.get("agreement") === "on";

  if (!variantId || !start || !end) {
    return { ok: false, error: "Data booking tidak lengkap." };
  }
  if (!agreement) {
    return { ok: false, error: "Harap setujui Syarat & Ketentuan dan Kebijakan Deposit." };
  }
  if (fulfillment === "shipping" && (!shippingAddress || !shippingCity)) {
    return { ok: false, error: "Alamat & kota pengiriman wajib diisi." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sesi habis. Silakan masuk lagi." };
  }

  const { data, error } = await supabase.rpc("create_booking_tx", {
    p_customer_id: user.id,
    p_variant_id: variantId,
    p_start: start,
    p_end: end,
    p_fulfillment: fulfillment,
    p_shipping_address: shippingAddress,
    p_shipping_city: shippingCity,
    p_shipping_fee_idr: shippingFee,
    p_customer_notes: customerNotes,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("23505") || msg.toLowerCase().includes("unique")) {
      return {
        ok: false,
        error:
          "Maaf, ada yang baru saja booking di tanggal ini. Coba pilih tanggal lain.",
      };
    }
    if (msg.includes("invalid_date_range")) return { ok: false, error: "Tanggal tidak valid." };
    if (msg.includes("too_few_days")) return { ok: false, error: "Tanggal kurang dari minimal sewa." };
    if (msg.includes("too_many_days")) return { ok: false, error: "Tanggal melebihi maksimal sewa." };
    if (msg.includes("dress_inactive") || msg.includes("variant_not_found")) {
      return { ok: false, error: "Dress sudah tidak tersedia." };
    }
    return { ok: false, error: "Gagal membuat booking. Coba lagi sebentar." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const code = (row as { booking_code: string } | null)?.booking_code;
  if (!code) return { ok: false, error: "Gagal membuat booking." };

  revalidatePath("/account/bookings");
  redirect(`/checkout/${code}/pay`);
}

export async function markBookingPaidByCustomer(formData: FormData) {
  /** Customer-facing "Saya sudah bayar" — flips a soft flag in partner_notes so
   *  admin sees it. The real status change happens when admin confirms. */
  const bookingCode = String(formData.get("booking_code") ?? "").trim();
  if (!bookingCode) return { ok: false, error: "Missing code." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  await supabase
    .from("bookings")
    .update({ partner_notes: "AWAITING_CONFIRMATION" })
    .eq("booking_code", bookingCode)
    .eq("customer_id", user.id);
  revalidatePath(`/checkout/${bookingCode}/pay`);
  return { ok: true };
}

export async function confirmBookingPaymentAction(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "").trim();
  if (!bookingId) return { ok: false, error: "Missing booking_id." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { ok: false, error: "Forbidden." };

  // Use the admin client so SECURITY DEFINER bypasses RLS as needed.
  const admin = createAdminClient();
  const { error } = await admin.rpc("confirm_booking_payment", {
    p_booking_id: bookingId,
    p_admin_id: user.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/account/bookings");
  return { ok: true };
}
