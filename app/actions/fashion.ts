"use server";

/**
 * LOVEW Fashion actions.
 * - submitListing is PUBLIC (any provider, no login) → uploads photos + inserts
 *   a 'pending' listing via the service-role client.
 * - setListingStatus/removeListing are studio-admin only.
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isStudioAdmin, waNumber, igHandle } from "@/lib/spaces";

export type FashionResult = { ok: boolean; error?: string };

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES = 6;

export async function submitListing(formData: FormData): Promise<FashionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Other";
  const listingType = String(formData.get("listing_type") ?? "").trim() || "Rent";
  const size = String(formData.get("size") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const whatsapp = waNumber(String(formData.get("whatsapp") ?? ""));
  const instagram = igHandle(String(formData.get("instagram") ?? ""));
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name) return { ok: false, error: "Please enter the piece name." };
  if (!whatsapp && !instagram) return { ok: false, error: "Add a WhatsApp number or Instagram so renters can reach you." };
  if (files.length === 0) return { ok: false, error: "Please add at least one photo." };
  if (files.length > MAX_IMAGES) return { ok: false, error: `Up to ${MAX_IMAGES} photos.` };

  const admin = createAdminClient();
  const { data: row, error: insErr } = await admin
    .from("fashion_listings")
    .insert({
      status: "pending",
      name,
      category,
      listing_type: listingType,
      size: size || null,
      price: price || null,
      city: city || null,
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
    const up = await admin.storage.from("fashion").upload(path, bytes, { contentType: f.type, upsert: true });
    if (!up.error) urls.push(admin.storage.from("fashion").getPublicUrl(path).data.publicUrl);
  }
  await admin.from("fashion_listings").update({ image_urls: urls, cover_url: urls[0] ?? null }).eq("id", id);
  return { ok: true };
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isStudioAdmin(user?.email) ? user : null;
}

export async function setListingStatus(formData: FormData): Promise<FashionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "published"].includes(status)) return { ok: false, error: "Bad status." };
  const admin = createAdminClient();
  const { error } = await admin.from("fashion_listings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/fashion");
  revalidatePath("/fashion/manage");
  return { ok: true };
}

export async function removeListing(formData: FormData): Promise<FashionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.storage.from("fashion").remove([0, 1, 2, 3, 4, 5].map((i) => `${id}/${i}.jpg`));
  const { error } = await admin.from("fashion_listings").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/fashion");
  revalidatePath("/fashion/manage");
  return { ok: true };
}
