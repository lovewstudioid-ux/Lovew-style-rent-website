"use client";

import { useState } from "react";
import { findSeat, type SeatMatch } from "@/app/actions/event";

export function SeatFinder({
  slug,
  title,
  date,
  note,
}: {
  slug: string;
  title: string;
  date: string | null;
  note: string | null;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ matches: SeatMatch[]; searched: boolean; error?: string }>({
    matches: [],
    searched: false,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await findSeat(slug, query);
    setBusy(false);
    setResult({ matches: res.matches, searched: true, error: res.error });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-4xl font-normal text-ink md:text-5xl">{title}</h1>
        {date && (
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink/45">
            {new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {note && <p className="mx-auto mt-4 max-w-sm text-sm font-light leading-relaxed text-ink/60">{note}</p>}

        <form onSubmit={submit} className="mt-10">
          <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.2em] text-wine">Type your name</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full border border-ink/20 bg-white px-4 py-3.5 text-center text-base text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-3 inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60"
          >
            {busy ? "Looking…" : "Find my seat →"}
          </button>
        </form>

        {result.searched && (
          <div className="mt-8">
            {result.error ? (
              <p className="text-sm text-wine">{result.error}</p>
            ) : result.matches.length === 0 ? (
              <p className="text-sm font-light text-ink/55">
                We couldn&apos;t find that name. Check the spelling, try your first or last name only, or ask your host.
              </p>
            ) : (
              <div className="space-y-3">
                {result.matches.map((m, i) => (
                  <div key={i} className="border border-ink/12 bg-[#faf8f5] px-6 py-6">
                    <p className="font-display text-xl text-ink">{m.name}</p>
                    <p className="mt-1 font-display text-4xl text-wine">Table {m.table_label}</p>
                    {m.seat && <p className="mt-1 text-sm text-ink/55">Seat {m.seat}</p>}
                    {m.note && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">{m.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="mt-14 text-[0.64rem] uppercase tracking-[0.18em] text-ink/35">
          Seating by <a href="/event" className="text-wine hover:underline">LOVEW</a>
        </p>
      </div>
    </main>
  );
}
