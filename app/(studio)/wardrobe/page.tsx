import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { WardrobeLanding } from "@/components/wardrobe-landing";
import { WardrobeManager } from "@/components/wardrobe-manager";
import type { WardrobeItem } from "@/lib/wardrobe";

export const metadata = { title: "Wardrobe — your closet, organised · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function WardrobePage() {
  // Before the backend is provisioned (e.g. local preview), show the landing.
  if (!env.supabaseConfigured) return <WardrobeLanding />;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <WardrobeLanding />;

  const { data } = await supabase
    .from("wardrobe_items")
    .select("*")
    .order("created_at", { ascending: false });

  return <WardrobeManager items={(data ?? []) as WardrobeItem[]} email={user.email ?? ""} />;
}
