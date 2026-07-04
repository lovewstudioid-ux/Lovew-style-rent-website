"use server";

/**
 * Gift-registry server actions.
 * - Owner actions run as the signed-in user (RLS enforces ownership).
 * - reserveItem is a PUBLIC action (guests, no login) — uses the admin client
 *   with explicit checks so guests can only reserve an unreserved item.
 */

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { makeSlug } from "@/lib/registry";

export type RegistryResult = { ok: boolean; error?: string; slug?: string };

const MAX_BYTES = 8 * 1024 * 1024;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Download a remote product image (Shopee/Tokopedia/etc. block hotlinking, so
 * we can't render their URL directly) and store it in our own bucket. Returns
 * the stored path + public URL, or null if it couldn't be fetched.
 */
async function downloadAndStore(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  remoteUrl: string,
): Promise<{ path: string; url: string } | null> {
  try {
    const res = await fetch(remoteUrl, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) return null;
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("avif") ? "avif" : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("registry").upload(path, buf, { contentType: type });
    if (up.error) return null;
    return { path, url: supabase.storage.from("registry").getPublicUrl(path).data.publicUrl };
  } catch {
    return null;
  }
}

/* ───────────────────────────────── CREATE REGISTRY ─────────────────────── */
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
    show_address: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/registry");
  return { ok: true, slug };
}

/* ───────────────────────────────── UPDATE REGISTRY ─────────────────────── */
export async function updateRegistry(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const shippingAddress = String(formData.get("shipping_address") ?? "").trim();
  const showAddress = formData.get("show_address") === "true";
  const paymentNote = String(formData.get("payment_note") ?? "").trim();

  if (!id) return { ok: false, error: "Missing registry ID." };
  if (!title) return { ok: false, error: "Title is required." };

  const { error } = await supabase
    .from("registries")
    .update({
      title,
      event_date: eventDate || null,
      note: note || null,
      shipping_address: shippingAddress || null,
      show_address: showAddress,
      payment_note: paymentNote || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/registry");
  revalidatePath(`/registry/${id}`);
  return { ok: true };
}

/* ─────────────────────────────── ADD REGISTRY ITEM ─────────────────────── */
export async function addRegistryItem(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const registryId = String(formData.get("registry_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const qtyRaw = parseInt(String(formData.get("qty") ?? "1"), 10);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
  const isPriority = String(formData.get("is_priority") ?? "false") === "true";
  const isGroup = String(formData.get("is_group") ?? "false") === "true";
  const note = String(formData.get("note") ?? "").trim();
  const imageUrlInput = String(formData.get("image_url") ?? "").trim();
  const file = formData.get("image");

  if (!registryId) return { ok: false, error: "Missing registry." };
  if (!name) return { ok: false, error: "Please enter an item name." };

  let image_path: string | null = null;
  let image_url: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { ok: false, error: "The file must be an image." };
    if (file.size > MAX_BYTES) return { ok: false, error: "Image is too large (max 8 MB)." };
    const ext = file.type.includes("png") ? "png" : "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const up = await supabase.storage
      .from("registry")
      .upload(path, bytes, { contentType: file.type });
    if (up.error) return { ok: false, error: `Upload failed: ${up.error.message}` };
    image_path = path;
    image_url = supabase.storage.from("registry").getPublicUrl(path).data.publicUrl;
  } else if (imageUrlInput) {
    // Fetched from a product link — download & re-host so it doesn't break later.
    const stored = await downloadAndStore(supabase, user.id, imageUrlInput);
    if (stored) {
      image_path = stored.path;
      image_url = stored.url;
    } else {
      image_url = imageUrlInput; // fallback: keep the raw URL
    }
  }
  // Photo is optional — an item can be just a name + link (e.g. an IG/TikTok
  // reference where the giver picks the product themselves).

  const { error } = await supabase.from("registry_items").insert({
    registry_id: registryId,
    name,
    category: "Other", // legacy column kept for back-compat; category_id is used now
    category_id: categoryId || null,
    image_path,
    image_url,
    link_url: linkUrl || null,
    price: price || null,
    currency: currency || null,
    qty,
    size: size || null,
    color: color || null,
    is_priority: isPriority,
    is_group: isGroup,
    note: note || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/registry/${registryId}`);
  return { ok: true };
}

/* ────────────────────────────── UPDATE REGISTRY ITEM ───────────────────── */
export async function updateRegistryItem(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const qtyRaw = parseInt(String(formData.get("qty") ?? "1"), 10);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
  const isPriority = String(formData.get("is_priority") ?? "false") === "true";
  const isGroup = String(formData.get("is_group") ?? "false") === "true";
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!id) return { ok: false, error: "Missing item ID." };
  if (!name) return { ok: false, error: "Item name is required." };

  // Fetch to verify ownership (via RLS — if user doesn't own this item's
  // registry the update will silently affect 0 rows, but we check explicitly)
  const { data: item } = await supabase
    .from("registry_items")
    .select("registry_id")
    .eq("id", id)
    .single();
  if (!item) return { ok: false, error: "Item not found." };

  const { error } = await supabase
    .from("registry_items")
    .update({
      name,
      category_id: categoryId || null,
      price: price || null,
      currency: currency || null,
      qty,
      size: size || null,
      color: color || null,
      is_priority: isPriority,
      is_group: isGroup,
      link_url: linkUrl || null,
      note: note || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/registry/${item.registry_id}`);
  return { ok: true };
}

/* ─────────────────────────────── CATEGORIES ────────────────────────────── */
export async function createCategory(formData: FormData): Promise<RegistryResult & { id?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const registryId = String(formData.get("registry_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const isPublic = String(formData.get("is_public") ?? "true") !== "false";
  if (!registryId) return { ok: false, error: "Missing registry." };
  if (!name) return { ok: false, error: "Please name the category." };

  const { data, error } = await supabase
    .from("registry_categories")
    .insert({ registry_id: registryId, name, is_public: isPublic })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/registry/${registryId}`);
  return { ok: true, id: data?.id as string };
}

export async function updateCategory(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const isPublic = String(formData.get("is_public") ?? "true") !== "false";
  if (!id) return { ok: false, error: "Missing category." };

  const { data: cat } = await supabase
    .from("registry_categories").select("registry_id").eq("id", id).single();
  if (!cat) return { ok: false, error: "Category not found." };

  const patch: Record<string, unknown> = { is_public: isPublic };
  if (name) patch.name = name;
  const { error } = await supabase.from("registry_categories").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/registry/${cat.registry_id}`);
  return { ok: true };
}

export async function deleteCategory(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const { data: cat } = await supabase
    .from("registry_categories").select("registry_id").eq("id", id).single();
  // Items keep existing (category_id set null via FK on delete).
  const { error } = await supabase.from("registry_categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (cat?.registry_id) revalidatePath(`/registry/${cat.registry_id}`);
  return { ok: true };
}

/* ─────────────────────── REQUEST ADDRESS (public) ──────────────────────── */
export async function requestAddress(formData: FormData): Promise<RegistryResult> {
  const registryId = String(formData.get("registry_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("guest_name") ?? "").trim();
  const email = String(formData.get("guest_email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!registryId || !name) return { ok: false, error: "Please enter your name." };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "That email looks off." };

  const admin = createAdminClient();
  const { error } = await admin.from("registry_address_requests").insert({
    registry_id: registryId,
    guest_name: name,
    guest_email: email || null,
    message: message || null,
  });
  if (error) return { ok: false, error: "Could not send your request." };
  if (slug) revalidatePath(`/r/${slug}`);
  return { ok: true };
}

/* ────────────────────────────── DELETE REGISTRY ITEM ───────────────────── */
export async function deleteRegistryItem(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const { data: item } = await supabase
    .from("registry_items")
    .select("image_path,registry_id")
    .eq("id", id)
    .single();
  const { error } = await supabase.from("registry_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (item?.image_path) await supabase.storage.from("registry").remove([item.image_path]);
  if (item?.registry_id) revalidatePath(`/registry/${item.registry_id}`);
  return { ok: true };
}

/* ─────────────────────────── RESERVE ITEM (public) ─────────────────────── */
export async function reserveItem(formData: FormData): Promise<RegistryResult> {
  const itemId = String(formData.get("item_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("guest_name") ?? "").trim();
  const email = String(formData.get("guest_email") ?? "").trim();
  const purchased = String(formData.get("purchased") ?? "false") === "true";
  if (!itemId || !name) return { ok: false, error: "Please enter your name." };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "That email looks off." };

  const admin = createAdminClient();
  const { data: item } = await admin
    .from("registry_items")
    .select("reserved_at")
    .eq("id", itemId)
    .single();
  if (!item) return { ok: false, error: "Item not found." };
  if (item.reserved_at)
    return { ok: false, error: "Someone just reserved this one — please pick another." };

  const { error } = await admin
    .from("registry_items")
    .update({
      reserved_by_name: name,
      reserved_by_email: email || null,
      reserved_at: new Date().toISOString(),
      purchased,
    })
    .eq("id", itemId)
    .is("reserved_at", null); // race guard

  if (error) return { ok: false, error: "Could not reserve. Please try again." };
  if (slug) revalidatePath(`/r/${slug}`);
  return { ok: true };
}

/* ───────────────────── GROUP GIFT CONTRIBUTIONS (public) ───────────────── */
/**
 * Add one or more contributions to a group gift. Supports both modes:
 *  - individual: one contributor_name[] + amount[] (+ optional paid)
 *  - organizer:  several contributor_name[] + amount[] pairs at once
 */
export async function addContributions(formData: FormData): Promise<RegistryResult> {
  const itemId = String(formData.get("item_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const paid = String(formData.get("paid") ?? "false") === "true";
  const names = formData.getAll("contributor_name").map((v) => String(v).trim());
  const amounts = formData.getAll("amount").map((v) => digits(String(v)));

  if (!itemId) return { ok: false, error: "Missing gift." };

  const rows = names
    .map((name, i) => ({ item_id: itemId, contributor_name: name, amount: amounts[i] ?? 0, paid }))
    .filter((r) => r.contributor_name && r.amount > 0);

  if (rows.length === 0) return { ok: false, error: "Add at least one name and amount." };

  const admin = createAdminClient();
  const { error } = await admin.from("registry_contributions").insert(rows);
  if (error) return { ok: false, error: "Could not save. Please try again." };
  if (slug) revalidatePath(`/r/${slug}`);
  return { ok: true };
}

function digits(v: string): number {
  const n = parseInt(v.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/* ─────────────────────── TOGGLE "MOST WANTED" (owner) ──────────────────── */
export async function togglePriority(formData: FormData): Promise<RegistryResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const id = String(formData.get("id") ?? "");
  const value = String(formData.get("is_priority") ?? "false") === "true";
  if (!id) return { ok: false, error: "Missing item." };

  const { data: item } = await supabase
    .from("registry_items").select("registry_id").eq("id", id).single();
  if (!item) return { ok: false, error: "Item not found." };

  const { error } = await supabase
    .from("registry_items").update({ is_priority: value }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/registry/${item.registry_id}`);
  return { ok: true };
}
