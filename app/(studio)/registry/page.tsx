import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { RegistryOwner } from "@/components/registry-owner";
import type { Registry } from "@/lib/registry";

export const metadata = { title: "Gift Registry · LOVEW Studio" };
export const dynamic = "force-dynamic";

const GATE = {
  eyebrow: "Gift Registry",
  title: "Make a wish list.",
  blurb:
    "Create a birthday or celebration registry, add the things you'd love, and share one link. Guests reserve gifts so nothing's doubled up.",
  next: "/registry",
};

export default async function RegistryPage() {
  if (!env.supabaseConfigured) return <MagicLinkGate {...GATE} />;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <MagicLinkGate {...GATE} />;

  const { data } = await supabase
    .from("registries")
    .select("*")
    .order("created_at", { ascending: false });

  return <RegistryOwner registries={(data ?? []) as Registry[]} />;
}
