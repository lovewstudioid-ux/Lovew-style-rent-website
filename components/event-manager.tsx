"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addGuest, addGuestsBulk, deleteGuest } from "@/app/actions/event";
import type { EventRow, EventGuest } from "@/lib/event";

export function EventManager({
  event,
  guests,
  shareUrl,
}: {
  event: EventRow;
  guests: EventGuest[];
  shareUrl: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"one" | "bulk" | null>(guests.length === 0 ? "one" : null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [table, setTable] = useState("");
  const [bulk, setBulk] = useState("");

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(shareUrl)}`;

  async function submitOne(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !table.trim()) return setErr("Enter a name and a table.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("event_id", event.id);
    fd.append("name", name.trim());
    fd.append("table_label", table.trim());
    const res = await addGuest(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not add.");
    setName(""); router.refresh();
  }

  async function submitBulk(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("event_id", event.id);
    fd.append("bulk", bulk);
    const res = await addGuestsBulk(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not import.");
    setBulk(""); setMode(null); router.refresh();
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("event_id", event.id);
    await deleteGuest(fd);
    router.refresh();
  }

  async function copyShare() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* */ }
  }

  // group guests by table
  const byTable = new Map<string, EventGuest[]>();
  for (const g of guests) {
    const k = g.table_label;
    if (!byTable.has(k)) byTable.set(k, []);
    byTable.get(k)!.push(g);
  }
  const tables = [...byTable.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const inputCls =
    "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-12 text-center md:py-16">
          <Link href="/event" className="text-[0.66rem] uppercase tracking-[0.2em] text-chiffon/55 hover:text-chiffon">← All events</Link>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-5xl">{event.title}</h1>
          {event.event_date && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-chiffon/55">
              {new Date(event.event_date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        {/* Share + QR */}
        <div className="grid gap-6 border border-ink/12 bg-[#faf8f5] p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-ink/45">Guests open this to find their seat</p>
            <code className="mt-2 block truncate text-sm text-ink/70">{shareUrl}</code>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={copyShare} className="bg-ink px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-wine">{copied ? "Copied ✓" : "Copy link"}</button>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="border border-ink/20 px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-wine hover:text-wine">Preview</a>
            </div>
          </div>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR code" className="mx-auto h-[140px] w-[140px] border border-ink/10 bg-white p-1" />
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-ink/40">Print or display the QR</p>
          </div>
        </div>

        {/* Add controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-ink">{guests.length} guest{guests.length === 1 ? "" : "s"} · {tables.length} table{tables.length === 1 ? "" : "s"}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setMode(mode === "one" ? null : "one"); setErr(""); }} className={`px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors ${mode === "one" ? "bg-wine text-chiffon" : "bg-ink text-white hover:bg-wine"}`}>+ Add guest</button>
            <button type="button" onClick={() => { setMode(mode === "bulk" ? null : "bulk"); setErr(""); }} className={`border px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors ${mode === "bulk" ? "border-wine text-wine" : "border-ink/20 text-ink hover:border-wine"}`}>Paste list</button>
          </div>
        </div>

        {mode === "one" && (
          <form onSubmit={submitOne} className="mt-6 flex flex-wrap items-end gap-3 border border-ink/12 bg-white p-6 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Guest name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="w-40">
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Table</label>
              <input className={inputCls} value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. 7 / Head" />
            </div>
            <button type="submit" disabled={busy} className="bg-ink px-7 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine disabled:opacity-60">{busy ? "…" : "Add"}</button>
            {err && <p className="w-full text-xs text-wine">{err}</p>}
          </form>
        )}

        {mode === "bulk" && (
          <form onSubmit={submitBulk} className="mt-6 space-y-3 border border-ink/12 bg-white p-6 shadow-sm">
            <label className="block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">One guest per line — <span className="text-ink">Name, Table</span></label>
            <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={8} className={`${inputCls} font-mono`} placeholder={"Maya Putri, 1\nReza Hakim, 1\nAira Latief, Head Table"} />
            {err && <p className="text-xs text-wine">{err}</p>}
            <button type="submit" disabled={busy} className="bg-ink px-7 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine disabled:opacity-60">{busy ? "Importing…" : "Import guests →"}</button>
          </form>
        )}

        {/* Guest list grouped by table */}
        {guests.length === 0 ? (
          <div className="mt-16 border-t border-ink/10 pt-16 text-center">
            <p className="font-display text-2xl text-ink/40">No guests yet.</p>
            <p className="mt-2 text-sm font-light text-ink/45">Add guests or paste your list, then share the link &amp; QR.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t) => (
              <div key={t} className="border border-ink/12 bg-white p-5">
                <p className="font-display text-lg text-ink">Table {t}</p>
                <ul className="mt-3 space-y-1.5">
                  {byTable.get(t)!.map((g) => (
                    <li key={g.id} className="group flex items-center justify-between text-sm text-ink/75">
                      <span>{g.name}</span>
                      <button type="button" onClick={() => remove(g.id)} aria-label="Remove" className="text-ink/30 opacity-0 transition-opacity hover:text-wine group-hover:opacity-100">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
