import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface AccountNav {
  name: string;
  email: string;
  hasStyleId: boolean;      // colour/style analysis generated
  hasMeasurements: boolean; // body measurements saved
}

/**
 * Fetch the signed-in user's nav state for the header account menu.
 * Returns null when Supabase isn't configured or nobody is signed in.
 */
export async function getAccountNav(): Promise<AccountNav | null> {
  if (!env.supabaseConfigured) return null;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Each query is guarded so a missing column/table (e.g. before a migration
    // runs) degrades gracefully instead of breaking the whole header.
    const safe = async (p: PromiseLike<{ data: unknown }>): Promise<Record<string, unknown> | null> => {
      try { return ((await p).data as Record<string, unknown>) ?? null; } catch { return null; }
    };
    const [profile, styleId, profileRow] = await Promise.all([
      safe(supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()),
      safe(supabase.from("style_id_results").select("id").eq("user_id", user.id).limit(1).maybeSingle()),
      safe(supabase.from("style_profiles").select("bust, waist, hips").eq("user_id", user.id).maybeSingle()),
    ]);

    const hasMeasurements = Boolean(profileRow?.bust || profileRow?.waist || profileRow?.hips);

    return {
      name: (profile?.full_name as string) || user.email || "",
      email: user.email ?? "",
      hasStyleId: Boolean(styleId),
      hasMeasurements,
    };
  } catch {
    return null;
  }
}
