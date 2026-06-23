import { notFound } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { StyleIdResult } from "@/components/style-id-result";
import type { StyleAnalysis } from "@/lib/style-id-prompts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!env.supabaseConfigured) return { title: "Style ID · LOVEW Studio" };
  const supabase = createClient();
  const { data } = await supabase.from("style_id_results").select("name, analysis").eq("slug", params.slug).single();
  const a = data?.analysis as StyleAnalysis | undefined;
  return { title: data ? `${(data as { name?: string }).name ?? "A"}'s Style ID — ${a?.season ?? ""} · LOVEW` : "Style ID · LOVEW Studio" };
}

export default async function SharedStyleIdPage({ params }: { params: { slug: string } }) {
  if (!env.supabaseConfigured) notFound();
  const supabase = createClient();
  const { data } = await supabase.from("style_id_results").select("*").eq("slug", params.slug).single();
  if (!data) notFound();
  const row = data as { name: string | null; analysis: StyleAnalysis; photo_url: string | null };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-lg tracking-wide text-ink">LOVEW <span className="text-wine">STUDIO</span></Link>
          <Link href="/discover" className="text-[0.62rem] uppercase tracking-[0.2em] text-wine hover:underline">Get your Style ID →</Link>
        </div>
      </header>
      <main className="mx-auto w-full px-6 py-12 md:py-16">
        <StyleIdResult
          analysis={row.analysis}
          photo={row.photo_url ?? ""}
          name={row.name ?? "Your"}
          demo={false}
          inquiry="https://tally.so/r/Gxd6ZL"
          shared
          savedSlug={params.slug}
        />
      </main>
    </div>
  );
}
