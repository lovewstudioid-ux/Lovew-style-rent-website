"use server";

/** Customer Style Profile — save sizing (owner row, upsert). */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StyleProfileResult = { ok: boolean; error?: string };

const FIELDS = [
  "full_name", "whatsapp", "height_cm", "weight_kg",
  "bust", "waist", "hips", "top_size", "bottom_size", "dress_size", "shoe_size", "notes",
] as const;

export async function saveStyleProfile(formData: FormData): Promise<StyleProfileResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const row: Record<string, string | null> = { user_id: user.id, updated_at: new Date().toISOString() };
  for (const f of FIELDS) {
    const v = String(formData.get(f) ?? "").trim();
    row[f] = v || null;
  }

  const { error } = await supabase.from("style_profiles").upsert(row, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/style-profile");
  return { ok: true };
}
