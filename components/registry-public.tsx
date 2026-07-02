"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reserveItem } from "@/app/actions/registry";
import type { Registry, RegistryItem } from "@/lib/registry";

export function RegistryPublic({ registry, items }: { registry: Registry; items: RegistryItem[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  async function reserve(item: RegistryItem) {
    if (!name.trim()) return setErr("Please enter your name.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("item_id", item.id);
    fd.append("slug", registry.slug);
    fd.append("guest_name", name.trim());
    fd.append("guest_email", email.trim());
    const res = await reserveItem(fd);
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "Could not reserve."); router.refresh(); return; }
    setDoneId(item.id); setActiveId(null); setName(""); setEmail("");
    router.refresh();
  }

  const inputCls =
    "w-full border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <main className="mx-auto max-w-editorial px-6 py-12 md:py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl font-normal text-ink md:text-5xl">{registry.title}</h1>
        {registry.event_date && (
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink/45">
            {new Date(registry.event_date).toLocaleDateString(undefined, {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        )}
        {registry.note && (
          <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-ink/60">
            {registry.note}
          </p>
        )}

        {/* Shipping address (only if owner chose to show it) */}
        {registry.show_address && registry.shipping_address && (
          <div className="mx-auto mt-6 inline-block border border-ink/12 bg-[#faf8f5] px-6 py-4 text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink/40">
              Ship to
            </p>
            <p className="mt-1 text-sm font-light leading-relaxed text-ink/70">
              {registry.shipping_address}
            </p>
          </div>
        )}

        <p className="mx-auto mt-6 max-w-md text-[0.72rem] uppercase tracking-[0.14em] text-wine">
          Reserve a gift so it isn&apos;t doubled up
        </p>
      </div>

      {/* Items grid */}
      {items.length === 0 ? (
        <p className="mt-16 text-center font-display text-2xl text-ink/40">
          No items yet — check back soon.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => {
            const reserved = Boolean(it.reserved_at) || doneId === it.id;
            return (
              <div key={it.id} className="flex flex-col">
                <div className={`relative aspect-square overflow-hidden border border-ink/8 bg-white ${reserved ? "opacity-60" : ""}`}>
                  {it.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.image_url}
                      alt={it.name}
                      className="h-full w-full object-contain p-2.5"
                      loading="lazy"
                    />
                  )}
                  {reserved && (
                    <span className="absolute left-2 top-2 bg-eucalyptus px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white">
                      Reserved
                    </span>
                  )}
                </div>

                <p className="mt-2.5 font-display text-base leading-tight text-ink">{it.name}</p>
                {it.price && <p className="mt-0.5 text-[0.82rem] font-light text-ink/70">{it.price}</p>}
                {it.note && (
                  <p className="mt-0.5 text-[0.68rem] font-light italic text-ink/45">{it.note}</p>
                )}
                {it.link_url && (
                  <a
                    href={it.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-ink/45 hover:text-wine"
                  >
                    View item →
                  </a>
                )}

                <div className="mt-auto pt-3">
                  {reserved ? (
                    <p className="text-[0.66rem] uppercase tracking-[0.12em] text-eucalyptus">
                      {doneId === it.id ? "Reserved by you ✓" : "Taken"}
                    </p>
                  ) : activeId === it.id ? (
                    <div className="space-y-2">
                      <input
                        className={inputCls}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                      <input
                        className={inputCls}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                      />
                      {err && <p className="text-[0.66rem] text-wine">{err}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => reserve(it)}
                          className="flex-1 bg-ink px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60"
                        >
                          {busy ? "…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveId(null); setErr(""); }}
                          className="border border-ink/20 px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-ink/60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(it.id); setErr(""); setName(""); setEmail("");
                      }}
                      className="w-full border border-ink/25 px-3 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine hover:text-wine"
                    >
                      I&apos;ll gift this
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-16 text-center text-[0.66rem] uppercase tracking-[0.18em] text-ink/35">
        Made with{" "}
        <a href="/registry" className="text-wine hover:underline">
          LOVEW Registry
        </a>
      </p>
    </main>
  );
}
