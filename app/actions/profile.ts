"use server";

/**
 * Profile mutations — basic field updates on public.profiles for the current
 * user. Returns a small result the page can render inline.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";

const VALID_CITIES = brand.cities.map((c) => c.toLowerCase());

export async function updateProfile(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const cityRaw = String(formData.get("city") ?? "").trim().toLowerCase();
  const city = VALID_CITIES.includes(cityRaw) ? cityRaw : null;

  if (!fullName) return { ok: false, error: "Nama tidak boleh kosong." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      city: city,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: "Gagal menyimpan profil." };

  revalidatePath("/account", "layout");
  return { ok: true };
}

/**
 * Lightweight profile capture used by the studio tools (Style ID etc.).
 * Upserts so it works for first-time magic-link users with no profile row yet.
 */
export async function saveProfile(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const get = (k: string) => String(formData.get(k) ?? "").trim() || null;
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { ok: false, error: "Please enter your full name." };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      nick_name: get("nick_name"),
      phone: get("phone"),
      instagram: get("instagram"),
      birth_date: get("birth_date"),
      gender: get("gender"),
      country: get("country"),
      city: get("city"),
      job_title: get("job_title"),
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/discover");
  return { ok: true };
}
