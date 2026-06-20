import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { EventOwner } from "@/components/event-owner";
import type { EventRow } from "@/lib/event";

export const metadata = { title: "Event Seating · LOVEW Studio" };
export const dynamic = "force-dynamic";

const GATE = {
  eyebrow: "Event Seating",
  title: "Find your seat.",
  blurb:
    "Build a digital seating chart in minutes. Assign guests to tables, share a link or QR code, and they'll find their seat in seconds — no app, no printing a giant board.",
  next: "/event",
};

export default async function EventPage() {
  if (!env.supabaseConfigured) return <MagicLinkGate {...GATE} />;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <MagicLinkGate {...GATE} />;

  const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
  return <EventOwner events={(data ?? []) as EventRow[]} />;
}
