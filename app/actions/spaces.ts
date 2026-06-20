"use server";

/**
 * Spaces actions.
 * - submitSpace is PUBLIC (any vendor, no login). Uploads photos + inserts a
 *   'pending' listing via the service-role client.
 * - publish/unpublish/remove are studio-admin only (verified by signed-in email).
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isStudioAdmin, waNumber, igHandle } from "@/lib/spaces";

export type SpacesResult = { ok: boolean; error?: string };

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES = 6;

export async function submitSpace(formData: FormData): Promise<SpacesResult> {
  const name = String(formData.get("name") ?? "").trim();
  const spaceType = String(formData.get("space_type") ?? "").trim() || "Other";
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const priceFrom = String(formData.get("price_from") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const whatsapp = waNumber(String(formData.get("whatsapp") ?? ""));
  const instagram = igHandle(String(formData.get("instagram") ?? ""));
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name) return { ok: false, error: "Please enter the space name." };
  if (!whatsapp && !instagram) return { ok: false, error: "Add a WhatsApp number or Instagram so guests can reach you." };
  if (files.length === 0) return { ok: false, error: "Please add at least one photo." };
  if (files.length > MAX_IMAGES) return { ok: false, error: `Up to ${MAX_IMAGES} photos.` };

  const admin = createAdminClient();

  // Insert first to get an id for the storage folder.
  const { data: row, error: insErr } = await admin
    .from("space_listings")
    .insert({
      status: "pending",
      name,
      space_type: spaceType,
      city: city || null,
      area: area || null,
      price_from: priceFrom || null,
      description: description || null,
      whatsapp,
      instagram,
    })
    .select("id")
    .single();
  if (insErr || !row) return { ok: false, error: "Could not save. Please try again." };
  const id = (row as { id: string }).id;

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!f.type.startsWith("image/")) continue;
    if (f.size > MAX_BYTES) return { ok: false, error: "Each photo must be under 8 MB." };
    const ext = f.type.includes("png") ? "png" : "jpg";
    const path = `${id}/${i}.${ext}`;
    const bytes = Buffer.from(await f.arrayBuffer());
    const up = await admin.storage.from("spaces").upload(path, bytes, { contentType: f.type, upsert: true });
    if (!up.error) urls.push(admin.storage.from("spaces").getPublicUrl(path).data.publicUrl);
  }

  await admin.from("space_listings").update({ image_urls: urls, cover_url: urls[0] ?? null }).eq("id", id);
  return { ok: true };
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isStudioAdmin(user?.email) ? user : null;
}

export async function setSpaceStatus(formData: FormData): Promise<SpacesResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "published"].includes(status)) return { ok: false, error: "Bad status." };
  const admin = createAdminClient();
  const { error } = await admin.from("space_listings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/spaces");
  revalidatePath("/spaces/manage");
  return { ok: true };
}

export async function removeSpace(formData: FormData): Promise<SpacesResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.storage.from("spaces").remove([`${id}/0.jpg`, `${id}/1.jpg`, `${id}/2.jpg`, `${id}/3.jpg`, `${id}/4.jpg`, `${id}/5.jpg`]);
  const { error } = await admin.from("space_listings").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/spaces");
  revalidatePath("/spaces/manage");
  return { ok: true };
}
