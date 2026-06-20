import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { RegistryItemManager } from "@/components/registry-item-manager";
import type { Registry, RegistryItem } from "@/lib/registry";

export const metadata = { title: "Manage registry · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function ManageRegistryPage({ params }: { params: { id: string } }) {
  if (!env.supabaseConfigured) {
    return <MagicLinkGate eyebrow="Gift Registry" title="Make a wish list." blurb="Sign in to manage your registry." next={`/registry/${params.id}`} />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <MagicLinkGate eyebrow="Gift Registry" title="Make a wish list." blurb="Sign in to manage your registry." next={`/registry/${params.id}`} />;
  }

  const { data: registry } = await supabase.from("registries").select("*").eq("id", params.id).single();
  if (!registry || (registry as Registry).user_id !== user.id) notFound();

  const { data: items } = await supabase
    .from("registry_items")
    .select("*")
    .eq("registry_id", params.id)
    .order("created_at", { ascending: false });

  const shareUrl = `${env.siteUrl}/r/${(registry as Registry).slug}`;

  return (
    <RegistryItemManager
      registry={registry as Registry}
      items={(items ?? []) as RegistryItem[]}
      shareUrl={shareUrl}
    />
  );
}
