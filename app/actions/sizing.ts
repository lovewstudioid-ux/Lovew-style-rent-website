"use server";

/**
 * Sizing-profile CRUD over public.sizing_profiles. Multiple profiles per user;
 * exactly one can be `is_default`. Setting default is atomic: clear the old
 * default in the same call.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function num(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value;
}

function str(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  return raw === "" ? null : raw;
}

export async function saveSizingProfile(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };

  const id = str(formData, "id");
  const label = str(formData, "label") ?? "My Size";
  const isDefault = formData.get("is_default") === "on";

  const row = {
    user_id: user.id,
    label,
    bust_cm: num(formData, "bust_cm"),
    waist_cm: num(formData, "waist_cm"),
    hip_cm: num(formData, "hip_cm"),
    shoulder_cm: num(formData, "shoulder_cm"),
    dress_length_cm: num(formData, "dress_length_cm"),
    height_cm: num(formData, "height_cm"),
    weight_kg: num(formData, "weight_kg"),
    size_label: str(formData, "size_label"),
    notes: str(formData, "notes"),
    is_default: isDefault,
  };

  if (id) {
    const { error } = await supabase.from("sizing_profiles").update(row).eq("id", id);
    if (error) return { ok: false, error: "Gagal menyimpan ukuran." };
  } else {
    const { error } = await supabase.from("sizing_profiles").insert(row);
    if (error) return { ok: false, error: "Gagal menambah ukuran." };
  }

  // Mutual exclusion of default: if this row is marked default, clear others.
  if (isDefault) {
    const query = supabase
      .from("sizing_profiles")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
    if (id) {
      await query.neq("id", id);
    } else {
      // For a freshly inserted row, re-apply default flag after the bulk clear.
      await query;
      await supabase
        .from("sizing_profiles")
        .update({ is_default: true })
        .eq("user_id", user.id)
        .eq("label", label)
        .order("created_at", { ascending: false })
        .limit(1);
    }
  }

  revalidatePath("/account/sizing");
  return { ok: true };
}

export async function deleteSizingProfile(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };

  const id = str(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };

  const { error } = await supabase
    .from("sizing_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Gagal menghapus." };

  revalidatePath("/account/sizing");
  return { ok: true };
}

export async function setDefaultSizingProfile(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };

  const id = str(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };

  // Clear current default, then mark the chosen one.
  await supabase
    .from("sizing_profiles")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);
  const { error } = await supabase
    .from("sizing_profiles")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Gagal mengatur default." };

  revalidatePath("/account/sizing");
  return { ok: true };
}
