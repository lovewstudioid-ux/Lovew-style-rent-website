"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions/event";
import type { EventRow } from "@/lib/event";

export function EventOwner({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(events.length === 0);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setErr("Please give it a title.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("event_date", date);
    const res = await createEvent(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not create.");
    setTitle(""); setDate(""); setOpen(false); router.refresh();
  }

  const inputCls =
    "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-14 text-center md:py-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">Event Seating</p>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-6xl">Your events</h1>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{events.length} event{events.length === 1 ? "" : "s"}</h2>
          <button type="button" onClick={() => { setOpen((v) => !v); setErr(""); }} className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine">
            {open ? "Close" : "+ New event"}
          </button>
        </div>

        {open && (
          <form onSubmit={submit} className="mt-8 max-w-lg space-y-4 border border-ink/12 bg-white p-6 shadow-sm md:p-8">
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Event title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Maya & Reza's Wedding" />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Date <span className="text-ink/35">(optional)</span></label>
              <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            {err && <p className="text-xs text-wine">{err}</p>}
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">
              {busy ? "Creating…" : "Create event →"}
            </button>
          </form>
        )}

        {events.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Link key={ev.id} href={`/event/${ev.id}`} className="group border border-ink/12 bg-white p-6 transition-colors hover:border-wine">
                <p className="font-display text-xl text-ink">{ev.title}</p>
                {ev.event_date && <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/45">{new Date(ev.event_date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>}
                <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-wine">Manage seating →</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
