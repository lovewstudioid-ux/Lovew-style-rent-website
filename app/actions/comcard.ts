"use server";

/** Comcards — multiple named measurement cards per user (self + friends). */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeBodyType } from "@/lib/body-type";

export interface Comcard {
  id: string;
  user_id: string;
  name: string;
  height_cm: string | null;
  weight_kg: string | null;
  bust: string | null;
  waist: string | null;
  hips: string | null;
  high_hip: string | null;
  top_size: string | null;
  pants_size: string | null;
  shoe_size: string | null;
  feet_length_cm: string | null;
  body_type: string | null;
  created_at: string;
}

export type ComcardResult = { ok: boolean; error?: string; id?: string };

const FIELDS = [
  "height_cm", "weight_kg", "bust", "waist", "hips", "high_hip",
  "top_size", "pants_size", "shoe_size", "feet_length_cm",
] as const;

export async function saveComcard(formData: FormData): Promise<ComcardResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Please enter a name for the card." };

  const row: Record<string, string | null> = { name };
  for (const f of FIELDS) {
    const v = String(formData.get(f) ?? "").trim();
    row[f] = v || null;
  }
  const bt = computeBodyType(row.bust ?? "", row.waist ?? "", row.hips ?? "");
  row.body_type = bt?.type ?? null;

  if (id) {
    const { error } = await supabase
      .from("comcards")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/discover");
    return { ok: true, id };
  }

  const { data, error } = await supabase
    .from("comcards")
    .insert({ ...row, user_id: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/discover");
  return { ok: true, id: data?.id as string };
}

export async function deleteComcard(formData: FormData): Promise<ComcardResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing card." };
  const { error } = await supabase.from("comcards").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/discover");
  return { ok: true };
}
