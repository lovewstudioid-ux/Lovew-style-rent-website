"use server";

/**
 * Gift-registry server actions.
 * - Owner actions run as the signed-in user (RLS enforces ownership).
 * - reserveItem is a PUBLIC action (guests, no login) and uses the admin client
 *   with explicit checks, so guests can only reserve an unreserved item.
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { makeSlug } from "@/lib/registry";

export type RegistryResult = { ok: boolean; error?: string; slug?: string };

const MAX_BYTES = 8 * 1024 * 1024;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function createRegistry(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!title) return { ok: false, error: "Please give your registry a title." };

  const slug = makeSlug(title);
  const { error } = await supabase.from("registries").insert({
    user_id: user.id,
    slug,
    title,
    event_date: eventDate || null,
    note: note || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/registry");
  return { ok: true, slug };
}

export async function addRegistryItem(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const registryId = String(formData.get("registry_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Other";
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const imageUrlInput = String(formData.get("image_url") ?? "").trim();
  const file = formData.get("image");
  if (!registryId) return { ok: false, error: "Missing registry." };
  if (!name) return { ok: false, error: "Please enter an item name." };

  let image_path: string | null = null;
  let image_url: string | null = imageUrlInput || null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { ok: false, error: "The file must be an image." };
    if (file.size > MAX_BYTES) return { ok: false, error: "Image is too large (max 8 MB)." };
    const ext = file.type.includes("png") ? "png" : "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const up = await supabase.storage.from("registry").upload(path, bytes, { contentType: file.type });
    if (up.error) return { ok: false, error: `Upload failed: ${up.error.message}` };
    image_path = path;
    image_url = supabase.storage.from("registry").getPublicUrl(path).data.publicUrl;
  }
  if (!image_url) return { ok: false, error: "Add a photo or paste an image link." };

  const { error } = await supabase.from("registry_items").insert({
    registry_id: registryId,
    name,
    category,
    image_path,
    image_url,
    link_url: linkUrl || null,
    price: price || null,
    note: note || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/registry/${registryId}`);
  return { ok: true };
}

export async function deleteRegistryItem(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const { data: item } = await supabase.from("registry_items").select("image_path,registry_id").eq("id", id).single();
  const { error } = await supabase.from("registry_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (item?.image_path) await supabase.storage.from("registry").remove([item.image_path]);
  if (item?.registry_id) revalidatePath(`/registry/${item.registry_id}`);
  return { ok: true };
}

/** PUBLIC: a guest reserves an item. Admin client, validated. */
export async function reserveItem(formData: FormData): Promise<RegistryResult> {
  const itemId = String(formData.get("item_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("guest_name") ?? "").trim();
  const email = String(formData.get("guest_email") ?? "").trim();
  if (!itemId || !name) return { ok: false, error: "Please enter your name." };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "That email looks off." };

  const admin = createAdminClient();
  const { data: item } = await admin.from("registry_items").select("reserved_at").eq("id", itemId).single();
  if (!item) return { ok: false, error: "Item not found." };
  if (item.reserved_at) return { ok: false, error: "Someone just reserved this one — please pick another." };

  const { error } = await admin
    .from("registry_items")
    .update({ reserved_by_name: name, reserved_by_email: email || null, reserved_at: new Date().toISOString() })
    .eq("id", itemId)
    .is("reserved_at", null); // guard against race
  if (error) return { ok: false, error: "Could not reserve. Please try again." };

  if (slug) revalidatePath(`/r/${slug}`);
  return { ok: true };
}
