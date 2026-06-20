"use server";

/** Digital-products actions — studio-admin only (add/edit/remove templates). */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isStudioAdmin } from "@/lib/spaces";

export type DigitalsResult = { ok: boolean; error?: string };

const MAX_BYTES = 8 * 1024 * 1024;

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isStudioAdmin(user?.email) ? user : null;
}

export async function addProduct(formData: FormData): Promise<DigitalsResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Templates";
  const price = String(formData.get("price") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const buyUrl = String(formData.get("buy_url") ?? "").trim();
  const coverUrlInput = String(formData.get("cover_url") ?? "").trim();
  const file = formData.get("cover");
  if (!title) return { ok: false, error: "Please enter a title." };

  const admin = createAdminClient();
  const { data: row, error: insErr } = await admin
    .from("digital_products")
    .insert({ title, category, price: price || null, description: description || null, buy_url: buyUrl || null })
    .select("id")
    .single();
  if (insErr || !row) return { ok: false, error: "Could not save." };
  const id = (row as { id: string }).id;

  let cover_url: string | null = coverUrlInput || null;
  let cover_path: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { ok: false, error: "Cover must be an image." };
    if (file.size > MAX_BYTES) return { ok: false, error: "Cover too large (max 8 MB)." };
    const ext = file.type.includes("png") ? "png" : "jpg";
    const path = `${id}/cover.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const up = await admin.storage.from("digitals").upload(path, bytes, { contentType: file.type, upsert: true });
    if (!up.error) {
      cover_path = path;
      cover_url = admin.storage.from("digitals").getPublicUrl(path).data.publicUrl;
    }
  }
  await admin.from("digital_products").update({ cover_url, cover_path }).eq("id", id);

  revalidatePath("/invitations");
  revalidatePath("/invitations/manage");
  return { ok: true };
}

export async function setProductStatus(formData: FormData): Promise<DigitalsResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["published", "hidden"].includes(status)) return { ok: false, error: "Bad status." };
  const admin = createAdminClient();
  const { error } = await admin.from("digital_products").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/invitations");
  revalidatePath("/invitations/manage");
  return { ok: true };
}

export async function removeProduct(formData: FormData): Promise<DigitalsResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.storage.from("digitals").remove([`${id}/cover.jpg`, `${id}/cover.png`]);
  const { error } = await admin.from("digital_products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/invitations");
  revalidatePath("/invitations/manage");
  return { ok: true };
}
