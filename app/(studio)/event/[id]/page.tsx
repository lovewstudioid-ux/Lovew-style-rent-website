import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { EventManager } from "@/components/event-manager";
import type { EventRow, EventGuest } from "@/lib/event";

export const metadata = { title: "Manage seating · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function ManageEventPage({ params }: { params: { id: string } }) {
  if (!env.supabaseConfigured) {
    return <MagicLinkGate eyebrow="Event Seating" title="Find your seat." blurb="Sign in to manage your seating chart." next={`/event/${params.id}`} />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <MagicLinkGate eyebrow="Event Seating" title="Find your seat." blurb="Sign in to manage your seating chart." next={`/event/${params.id}`} />;
  }

  const { data: event } = await supabase.from("events").select("*").eq("id", params.id).single();
  if (!event || (event as EventRow).user_id !== user.id) notFound();

  const { data: guests } = await supabase
    .from("event_guests")
    .select("*")
    .eq("event_id", params.id)
    .order("name", { ascending: true });

  const shareUrl = `${env.siteUrl}/seat/${(event as EventRow).slug}`;

  return (
    <EventManager
      event={event as EventRow}
      guests={(guests ?? []) as EventGuest[]}
      shareUrl={shareUrl}
    />
  );
}
