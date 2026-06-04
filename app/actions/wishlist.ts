"use server";

/**
 * Toggle a wishlist entry for the current user. If logged out, returns a
 * `requiresAuth` flag so the calling button can redirect to /sign-in.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(
  formData: FormData,
): Promise<{ ok: boolean; isWishlisted?: boolean; requiresAuth?: boolean; error?: string }> {
  const dressId = String(formData.get("dress_id") ?? "").trim();
  if (!dressId) return { ok: false, error: "Missing dress_id." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, requiresAuth: true };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("dress_id")
    .eq("user_id", user.id)
    .eq("dress_id", dressId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("dress_id", dressId);
    revalidatePath("/account/wishlist");
    revalidatePath("/browse");
    return { ok: true, isWishlisted: false };
  }

  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: user.id, dress_id: dressId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/wishlist");
  revalidatePath("/browse");
  return { ok: true, isWishlisted: true };
}
