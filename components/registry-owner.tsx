"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRegistry } from "@/app/actions/registry";
import type { Registry } from "@/lib/registry";

export function RegistryOwner({ registries }: { registries: Registry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(registries.length === 0);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setErr("Please give it a title.");
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("event_date", date);
    fd.append("note", note.trim());
    const res = await createRegistry(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not create.");
    setTitle(""); setDate(""); setNote(""); setOpen(false);
    router.refresh();
  }

  const inputCls =
    "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-14 text-center md:py-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">Gift Registry</p>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-6xl">Your registries</h1>
          <p className="mx-auto mt-3 max-w-sm text-[0.8rem] font-light text-chiffon/60">
            Create a wishlist for any occasion — birthday, wedding, graduation, or just because.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">
            {registries.length} registr{registries.length === 1 ? "y" : "ies"}
          </h2>
          <button
            type="button"
            onClick={() => { setOpen((v) => !v); setErr(""); }}
            className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine"
          >
            {open ? "Close" : "+ New registry"}
          </button>
        </div>

        {open && (
          <form
            onSubmit={submit}
            className="mt-8 max-w-lg space-y-4 border border-ink/12 bg-white p-6 shadow-sm md:p-8"
          >
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Title</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aira's 25th Birthday"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">
                Date <span className="text-ink/35">(optional)</span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">
                Note to guests <span className="text-ink/35">(optional)</span>
              </label>
              <input
                className={inputCls}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A little message for your guests…"
              />
            </div>
            <p className="text-[0.7rem] text-ink/45">
              Shipping address &amp; privacy settings available after creating.
            </p>
            {err && <p className="text-xs text-wine">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create registry →"}
            </button>
          </form>
        )}

        {registries.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {registries.map((r) => (
              <Link
                key={r.id}
                href={`/registry/${r.id}`}
                className="group border border-ink/12 bg-white p-6 transition-colors hover:border-wine"
              >
                <p className="font-display text-xl text-ink">{r.title}</p>
                {r.event_date && (
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/45">
                    {new Date(r.event_date).toLocaleDateString(undefined, {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                )}
                {r.note && (
                  <p className="mt-2 line-clamp-2 text-[0.78rem] font-light text-ink/55">{r.note}</p>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-wine">Manage & share →</p>
                  {r.shipping_address && (
                    <span className="text-[0.62rem] uppercase tracking-[0.1em] text-ink/35">
                      {r.show_address ? "Address visible" : "Address hidden"}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
