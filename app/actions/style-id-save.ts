"use server";

/** Save a Style ID result → returns a public share slug for /s/[slug]. */

import { createAdminClient } from "@/lib/supabase/server";

export type SaveResult = { ok: boolean; error?: string; slug?: string };

export async function saveStyleIdResult(formData: FormData): Promise<SaveResult> {
  const name = String(formData.get("name") ?? "").trim();
  const analysisRaw = String(formData.get("analysis") ?? "");
  const photo = formData.get("photo");

  let analysis: unknown;
  try {
    analysis = JSON.parse(analysisRaw);
  } catch {
    return { ok: false, error: "Could not save — please try again." };
  }

  const admin = createAdminClient();
  const slug = Math.random().toString(36).slice(2, 10);

  let photo_url: string | null = null;
  if (photo instanceof File && photo.size > 0 && photo.size < 8 * 1024 * 1024) {
    const ext = photo.type.includes("png") ? "png" : "jpg";
    const path = `${slug}.${ext}`;
    const bytes = Buffer.from(await photo.arrayBuffer());
    const up = await admin.storage.from("style-id-public").upload(path, bytes, { contentType: photo.type, upsert: true });
    if (!up.error) photo_url = admin.storage.from("style-id-public").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await admin.from("style_id_results").insert({ slug, name: name || null, analysis, photo_url });
  if (error) return { ok: false, error: "Could not save — please try again." };
  return { ok: true, slug };
}
