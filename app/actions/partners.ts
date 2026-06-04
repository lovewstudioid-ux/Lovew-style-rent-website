"use server";

/** Admin actions on partners: approve, suspend, edit commission. */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
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
  return { ok: true, userId: user.id };
}

export async function setPartnerStatus(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const partnerId = String(formData.get("partner_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!partnerId || !["active", "pending", "suspended"].includes(status)) {
    return { ok: false, error: "Bad input." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ status })
    .eq("id", partnerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/partners");
  return { ok: true };
}

export async function setPartnerCommission(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const partnerId = String(formData.get("partner_id") ?? "").trim();
  const pct = Number(formData.get("commission_pct") ?? 15);
  if (!partnerId || !Number.isFinite(pct) || pct < 0 || pct > 50) {
    return { ok: false, error: "Bad input." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ commission_pct: pct })
    .eq("id", partnerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/partners");
  return { ok: true };
}
