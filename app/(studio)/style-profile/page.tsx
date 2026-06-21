import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { StyleProfileForm } from "@/components/style-profile-form";

export const metadata = { title: "Style Profile — your measurements · LOVEW Studio" };
export const dynamic = "force-dynamic";

const GATE = {
  eyebrow: "Style Profile",
  title: "Save your sizing.",
  blurb: "Keep your measurements in one place so renting and shopping always fits — and share them with providers in a tap.",
  next: "/style-profile",
};

export default async function StyleProfilePage() {
  if (!env.supabaseConfigured) return <MagicLinkGate {...GATE} />;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <MagicLinkGate {...GATE} />;

  const { data } = await supabase.from("style_profiles").select("*").eq("user_id", user.id).maybeSingle();
  return <StyleProfileForm profile={(data as Record<string, string | null>) ?? null} email={user.email ?? ""} />;
}
