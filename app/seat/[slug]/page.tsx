import { notFound } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { SeatFinder } from "@/components/seat-finder";
import type { EventRow } from "@/lib/event";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!env.supabaseConfigured) return { title: "Find your seat · LOVEW Studio" };
  const supabase = createClient();
  const { data } = await supabase.from("events").select("title").eq("slug", params.slug).single();
  return { title: data ? `${(data as { title: string }).title} · Find your seat` : "Find your seat · LOVEW Studio" };
}

export default async function PublicSeatPage({ params }: { params: { slug: string } }) {
  if (!env.supabaseConfigured) notFound();

  const supabase = createClient();
  const { data: event } = await supabase.from("events").select("*").eq("slug", params.slug).single();
  if (!event) notFound();
  const ev = event as EventRow;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-lg tracking-wide text-ink">
            LOVEW <span className="text-wine">STUDIO</span>
          </Link>
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-ink/40">Seating</span>
        </div>
      </header>
      <SeatFinder slug={ev.slug} title={ev.title} date={ev.event_date} note={ev.note} />
    </div>
  );
}
