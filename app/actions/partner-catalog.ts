"use server";

/**
 * Partner-side catalog actions. Tonight just the status toggle so partners
 * can hide/show their dresses without admin help. Full create/edit/availability
 * UI ships in a follow-up.
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function setDressStatus(formData: FormData): Promise<Result> {
  const dressId = String(formData.get("dress_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!dressId) return { ok: false, error: "Missing dress_id." };
  if (!["active", "draft", "archived"].includes(status)) {
    return { ok: false, error: "Status invalid." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Verify ownership.
  const { data: row } = await supabase
    .from("dresses")
    .select("partner_id, partners ( owner_user_id )")
    .eq("id", dressId)
    .maybeSingle();
  if (!row) return { ok: false, error: "Dress tidak ditemukan." };

  const partner = Array.isArray(row.partners) ? row.partners[0] : row.partners;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  if (!isAdmin && partner?.owner_user_id !== user.id) {
    return { ok: false, error: "Bukan dress kamu." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("dresses").update({ status }).eq("id", dressId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/partner/catalog");
  revalidatePath("/browse");
  return { ok: true };
}
