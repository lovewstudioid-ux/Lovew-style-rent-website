"use server";

/**
 * Wardrobe server actions. Each runs as the signed-in user (cookie session),
 * so Supabase RLS enforces that users only touch their own items/files.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WardrobeActionResult = { ok: boolean; error?: string };

const MAX_BYTES = 8 * 1024 * 1024;

export async function addWardrobeItem(formData: FormData): Promise<WardrobeActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const name = String(formData.get("name") ?? "").trim();
  const category = (String(formData.get("category") ?? "").trim() || "Other");
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const imageUrlInput = String(formData.get("image_url") ?? "").trim();
  const file = formData.get("image");

  if (!name) return { ok: false, error: "Please enter a name." };

  let image_path: string | null = null;
  let image_url: string | null = imageUrlInput || null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { ok: false, error: "The file must be an image." };
    if (file.size > MAX_BYTES) return { ok: false, error: "Image is too large (max 8 MB)." };
    const ext = file.type.includes("png") ? "png" : "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const up = await supabase.storage.from("wardrobe").upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (up.error) return { ok: false, error: `Upload failed: ${up.error.message}` };
    image_path = path;
    image_url = supabase.storage.from("wardrobe").getPublicUrl(path).data.publicUrl;
  }

  if (!image_url) return { ok: false, error: "Add a photo or paste an image link." };

  const { error } = await supabase.from("wardrobe_items").insert({
    user_id: user.id,
    name,
    category,
    image_path,
    image_url,
    link_url: linkUrl || null,
    note: note || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/wardrobe");
  return { ok: true };
}

export async function deleteWardrobeItem(formData: FormData): Promise<WardrobeActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing item id." };

  const { data: item } = await supabase
    .from("wardrobe_items")
    .select("image_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (item?.image_path) {
    await supabase.storage.from("wardrobe").remove([item.image_path]);
  }

  revalidatePath("/wardrobe");
  return { ok: true };
}
