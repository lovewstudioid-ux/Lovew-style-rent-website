import { notFound } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { RegistryPublic } from "@/components/registry-public";
import type { Registry, RegistryItem, RegistryCategory } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!env.supabaseConfigured) return { title: "Registry · LOVEW Studio" };
  const supabase = createClient();
  const { data } = await supabase.from("registries").select("title").eq("slug", params.slug).single();
  return { title: data ? `${(data as { title: string }).title} · Gift Registry` : "Registry · LOVEW Studio" };
}

export default async function PublicRegistryPage({ params }: { params: { slug: string } }) {
  if (!env.supabaseConfigured) notFound();

  const supabase = createClient();
  const { data: registry } = await supabase.from("registries").select("*").eq("slug", params.slug).single();
  if (!registry) notFound();

  const registryId = (registry as Registry).id;
  const [{ data: itemsRaw }, { data: catsRaw }] = await Promise.all([
    supabase.from("registry_items").select("*").eq("registry_id", registryId).order("created_at", { ascending: false }),
    supabase.from("registry_categories").select("*").eq("registry_id", registryId).order("created_at", { ascending: true }),
  ]);

  const allCats = (catsRaw ?? []) as RegistryCategory[];
  // Guests only see public categories, and only items that are uncategorized
  // or belong to a public category (private categories stay hidden).
  const publicCats = allCats.filter((c) => c.is_public);
  const privateIds = new Set(allCats.filter((c) => !c.is_public).map((c) => c.id));
  const items = ((itemsRaw ?? []) as RegistryItem[]).filter(
    (it) => !it.category_id || !privateIds.has(it.category_id),
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-lg tracking-wide text-ink">
            LOVEW <span className="text-wine">STUDIO</span>
          </Link>
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-ink/40">Gift Registry</span>
        </div>
      </header>
      <RegistryPublic
        registry={registry as Registry}
        items={items}
        categories={publicCats}
      />
    </div>
  );
}
