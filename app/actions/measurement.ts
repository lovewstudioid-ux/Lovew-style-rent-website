"use server";

/** Save body measurements to the customer's style_profiles row (owner, upsert). */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeBodyType } from "@/lib/body-type";

export type MeasurementResult = { ok: boolean; error?: string; bodyType?: string };

const FIELDS = [
  "height_cm", "weight_kg", "bust", "waist", "hips", "high_hip",
  "top_size", "pants_size", "shoe_size", "feet_length_cm",
] as const;

export async function saveMeasurement(formData: FormData): Promise<MeasurementResult> {
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
  const bt = computeBodyType(row.bust ?? "", row.waist ?? "", row.hips ?? "");
  row.body_type = bt?.type ?? null;

  const { error } = await supabase.from("style_profiles").upsert(row, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/discover");
  return { ok: true, bodyType: bt?.type };
}
