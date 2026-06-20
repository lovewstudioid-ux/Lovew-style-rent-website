"use server";

/**
 * Event seating-chart actions.
 * - Owner actions run as the signed-in user (RLS enforces ownership).
 * - findSeat is PUBLIC (guests, no login): it returns only rows matching the
 *   typed name, so the full guest list is never shipped to the page.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { makeSlug } from "@/lib/registry";

export type EventResult = { ok: boolean; error?: string; slug?: string; added?: number };
export type SeatMatch = { name: string; table_label: string; seat: string | null; note: string | null };

export async function createEvent(formData: FormData): Promise<EventResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!title) return { ok: false, error: "Please give your event a title." };

  const slug = makeSlug(title);
  const { error } = await supabase.from("events").insert({
    user_id: user.id,
    slug,
    title,
    event_date: eventDate || null,
    note: note || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/event");
  return { ok: true, slug };
}

export async function addGuest(formData: FormData): Promise<EventResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const eventId = String(formData.get("event_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const tableLabel = String(formData.get("table_label") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!eventId) return { ok: false, error: "Missing event." };
  if (!name) return { ok: false, error: "Please enter a guest name." };
  if (!tableLabel) return { ok: false, error: "Please enter a table." };

  const { error } = await supabase.from("event_guests").insert({
    event_id: eventId,
    name,
    table_label: tableLabel,
    note: note || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/event/${eventId}`);
  return { ok: true };
}

/** Bulk add: textarea of "Name, Table" (or "Name | Table") lines. */
export async function addGuestsBulk(formData: FormData): Promise<EventResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const eventId = String(formData.get("event_id") ?? "");
  const raw = String(formData.get("bulk") ?? "");
  if (!eventId) return { ok: false, error: "Missing event." };

  const rows = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,|\t]/).map((p) => p.trim());
      return { name: parts[0] ?? "", table: parts[1] ?? "" };
    })
    .filter((r) => r.name && r.table);

  if (rows.length === 0) {
    return { ok: false, error: 'No valid rows. Use "Name, Table" — one per line.' };
  }

  const { error } = await supabase.from("event_guests").insert(
    rows.map((r) => ({ event_id: eventId, name: r.name, table_label: r.table })),
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/event/${eventId}`);
  return { ok: true, added: rows.length };
}

export async function deleteGuest(formData: FormData): Promise<EventResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  const id = String(formData.get("id") ?? "");
  const eventId = String(formData.get("event_id") ?? "");
  const { error } = await supabase.from("event_guests").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (eventId) revalidatePath(`/event/${eventId}`);
  return { ok: true };
}

/** PUBLIC: find a guest's table by typed name within an event slug. */
export async function findSeat(slug: string, query: string): Promise<{ ok: boolean; matches: SeatMatch[]; error?: string }> {
  const q = query.trim();
  if (q.length < 2) return { ok: false, matches: [], error: "Type at least 2 letters." };

  const supabase = createClient();
  const { data: ev } = await supabase.from("events").select("id").eq("slug", slug).single();
  if (!ev) return { ok: false, matches: [], error: "Event not found." };

  const { data } = await supabase
    .from("event_guests")
    .select("name,table_label,seat,note")
    .eq("event_id", (ev as { id: string }).id)
    .ilike("name", `%${q}%`)
    .limit(10);

  return { ok: true, matches: (data ?? []) as SeatMatch[] };
}
