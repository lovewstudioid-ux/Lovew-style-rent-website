"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reserveItem, requestAddress, startGroupGift } from "@/app/actions/registry";
import { ItemPhoto, ItemMeta, Heart } from "@/components/registry-item-manager";
import { GroupGiftPublic } from "@/components/group-gift";
import type { Registry, RegistryItem, RegistryCategory, Contribution } from "@/lib/registry";

export function RegistryPublic({
  registry,
  items,
  categories,
  contributions,
}: {
  registry: Registry;
  items: RegistryItem[];
  categories: RegistryCategory[];
  contributions: Contribution[];
}) {
  const contribBy = (id: string) => contributions.filter((c) => c.item_id === id);
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [intent, setIntent] = useState<"buy" | "bought" | "split" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // "split it with friends" — organizer fields
  const [splitPayment, setSplitPayment] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [splitPaid, setSplitPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Address request
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrEmail, setAddrEmail] = useState("");
  const [addrMsg, setAddrMsg] = useState("");
  const [addrBusy, setAddrBusy] = useState(false);
  const [addrDone, setAddrDone] = useState(false);
  const [addrErr, setAddrErr] = useState("");

  function openGift(id: string) {
    setActiveId(id); setIntent(null); setErr(""); setName(""); setEmail("");
    setSplitPayment(""); setSplitAmount(""); setSplitPaid(false);
  }

  async function startSplit(item: RegistryItem) {
    if (!name.trim()) return setErr("Please enter your name.");
    if (!splitPayment.trim()) return setErr("Add where co-gifters should send their share.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("item_id", item.id);
    fd.append("slug", registry.slug);
    fd.append("organizer", name.trim());
    fd.append("payment", splitPayment.trim());
    fd.append("amount", splitAmount);
    fd.append("paid", String(splitPaid));
    const res = await startGroupGift(fd);
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "Could not start."); return; }
    setActiveId(null); setIntent(null);
    router.refresh();
  }

  async function reserve(item: RegistryItem) {
    if (!name.trim()) return setErr("Please enter your name.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("item_id", item.id);
    fd.append("slug", registry.slug);
    fd.append("guest_name", name.trim());
    fd.append("guest_email", email.trim());
    fd.append("purchased", String(intent === "bought"));
    const res = await reserveItem(fd);
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "Could not reserve."); router.refresh(); return; }
    setDoneId(item.id); setActiveId(null); setIntent(null); setName(""); setEmail("");
    router.refresh();
  }

  async function submitAddressRequest() {
    if (!addrName.trim()) return setAddrErr("Please enter your name.");
    setAddrBusy(true); setAddrErr("");
    const fd = new FormData();
    fd.append("registry_id", registry.id);
    fd.append("slug", registry.slug);
    fd.append("guest_name", addrName.trim());
    fd.append("guest_email", addrEmail.trim());
    fd.append("message", addrMsg.trim());
    const res = await requestAddress(fd);
    setAddrBusy(false);
    if (!res.ok) return setAddrErr(res.error ?? "Could not send.");
    setAddrDone(true);
  }

  const inputCls = "w-full border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  const hasUncategorized = items.some((it) => !it.category_id);
  const hasPriority = items.some((it) => it.is_priority);
  const shown = items
    .filter((it) =>
      filter === "all" ? true
        : filter === "priority" ? it.is_priority
        : filter === "none" ? !it.category_id
        : it.category_id === filter,
    )
    .sort((a, b) => Number(b.is_priority) - Number(a.is_priority));
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "";

  return (
    <main className="mx-auto max-w-editorial px-6 py-12 md:py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl font-normal text-ink md:text-5xl">{registry.title}</h1>
        {registry.event_date && (
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink/45">
            {new Date(registry.event_date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {registry.note && (
          <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-ink/60">{registry.note}</p>
        )}

        {/* Shipping address — shown if public, else a request button */}
        {registry.show_address && registry.shipping_address ? (
          <div className="mx-auto mt-6 inline-block border border-ink/12 bg-[#faf8f5] px-6 py-4 text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink/40">Ship to</p>
            <p className="mt-1 text-sm font-light leading-relaxed text-ink/70">{registry.shipping_address}</p>
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-sm">
            {addrDone ? (
              <p className="border border-eucalyptus/40 bg-[#f3f6f2] px-4 py-3 text-[0.8rem] text-ink/70">
                Thanks! {registry.title.split(" ")[0] || "The host"} will share the address with you.
              </p>
            ) : !addrOpen ? (
              <button type="button" onClick={() => setAddrOpen(true)} className="border border-ink/25 px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine hover:text-wine">
                Request shipping address
              </button>
            ) : (
              <div className="space-y-2 border border-ink/15 bg-white p-4 text-left shadow-sm">
                <p className="text-[0.72rem] text-ink/55">Ask the host for their shipping address:</p>
                <input className={inputCls} value={addrName} onChange={(e) => setAddrName(e.target.value)} placeholder="Your name" />
                <input className={inputCls} type="email" value={addrEmail} onChange={(e) => setAddrEmail(e.target.value)} placeholder="Your email (so they can reply)" />
                <textarea className={inputCls} rows={2} value={addrMsg} onChange={(e) => setAddrMsg(e.target.value)} placeholder="Optional message…" />
                {addrErr && <p className="text-[0.7rem] text-wine">{addrErr}</p>}
                <div className="flex gap-2">
                  <button type="button" disabled={addrBusy} onClick={submitAddressRequest} className="flex-1 bg-ink px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">{addrBusy ? "Sending…" : "Send request"}</button>
                  <button type="button" onClick={() => setAddrOpen(false)} className="border border-ink/20 px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-ink/60">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mx-auto mt-6 max-w-md text-[0.72rem] uppercase tracking-[0.14em] text-wine">Reserve a gift so it isn&apos;t doubled up</p>
      </div>

      {/* Category filter */}
      {(categories.length > 0 || hasUncategorized || hasPriority) && items.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[{ id: "all", label: "All" }, ...(hasPriority ? [{ id: "priority", label: "♥ Most wanted" }] : []), ...categories.map((c) => ({ id: c.id, label: c.name })), ...(hasUncategorized ? [{ id: "none", label: "Other" }] : [])].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`border px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.12em] transition-colors ${filter === c.id ? "border-wine bg-wine text-chiffon" : "border-ink/20 text-ink/60 hover:border-wine"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Heart legend for guests */}
      {hasPriority && items.length > 0 && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.72rem] text-ink/50">
          <Heart filled className="h-3 w-3 text-wine" />
          <span><span className="text-wine">Most wanted</span> — the gifts {registry.title.split(" ")[0] || "the host"} would love most.</span>
        </p>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <p className="mt-16 text-center font-display text-2xl text-ink/40">No items yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((it) => {
            const reserved = Boolean(it.reserved_at) || doneId === it.id;
            return (
              <div key={it.id} className="flex flex-col">
                <div className={`relative aspect-square overflow-hidden border border-ink/8 bg-white ${reserved ? "opacity-60" : ""}`}>
                  <ItemPhoto src={it.image_url} alt={it.name} />
                  {it.is_priority && (
                    <span title="Most wanted" className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-wine text-chiffon shadow">
                      <Heart filled className="h-3 w-3" />
                    </span>
                  )}
                  {reserved && (
                    <span className="absolute left-2 top-2 bg-eucalyptus px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white">{it.purchased ? "Purchased" : "Reserved"}</span>
                  )}
                </div>

                {it.category_id && <p className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-wine">{catName(it.category_id)}</p>}
                <p className="mt-1 font-display text-base leading-tight text-ink">{it.name}</p>
                <ItemMeta it={it} />
                {it.note && <p className="mt-0.5 text-[0.68rem] font-light italic text-ink/45">{it.note}</p>}
                {it.link_url && (
                  <a href={it.link_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-ink/45 hover:text-wine">View item →</a>
                )}

                {it.is_group ? (
                  <GroupGiftPublic item={it} contributions={contribBy(it.id)} slug={registry.slug} />
                ) : (
                <div className="mt-auto pt-3">
                  {reserved ? (
                    <p className="text-[0.66rem] uppercase tracking-[0.12em] text-eucalyptus">
                      {doneId === it.id ? (it.purchased ? "You marked this bought ✓" : "Reserved by you ✓") : it.purchased ? "Purchased ✓" : "Reserved"}
                    </p>
                  ) : activeId === it.id ? (
                    intent === null ? (
                      // Step 1 — choose how to gift
                      <div className="space-y-2">
                        <p className="text-[0.66rem] text-ink/55">How would you like to gift this?</p>
                        <button type="button" onClick={() => setIntent("buy")} className="w-full bg-ink px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-white transition-colors hover:bg-wine">I&apos;ll buy this gift</button>
                        <button type="button" onClick={() => setIntent("bought")} className="w-full border border-ink/25 px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-ink transition-colors hover:border-wine hover:text-wine">I already bought this</button>
                        <button type="button" onClick={() => setIntent("split")} className="w-full border border-wine/40 px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-wine transition-colors hover:bg-wine hover:text-chiffon">Split it with friends</button>
                        <button type="button" onClick={() => setActiveId(null)} className="w-full py-1 text-[0.62rem] uppercase tracking-[0.12em] text-ink/45 hover:text-ink">Cancel</button>
                      </div>
                    ) : intent === "split" ? (
                      // Start a group gift (you organize + collect)
                      <div className="space-y-2">
                        <p className="text-[0.64rem] uppercase tracking-[0.1em] text-wine">Start a group gift</p>
                        <p className="text-[0.66rem] leading-relaxed text-ink/55">You&apos;ll collect everyone&apos;s share and buy it. Friends send their part to you.</p>
                        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                        <input className={inputCls} value={splitPayment} onChange={(e) => setSplitPayment(e.target.value)} placeholder="Where friends send their share (bank / QRIS / e-wallet)" />
                        <input className={inputCls} value={splitAmount} onChange={(e) => setSplitAmount(e.target.value)} placeholder="Your own share (optional), e.g. 500.000" inputMode="numeric" />
                        <label className="flex cursor-pointer items-center gap-2 text-[0.7rem] text-ink/60">
                          <input type="checkbox" checked={splitPaid} onChange={(e) => setSplitPaid(e.target.checked)} className="h-3.5 w-3.5 accent-wine" />
                          I&apos;ve put in my share already
                        </label>
                        {err && <p className="text-[0.66rem] text-wine">{err}</p>}
                        <div className="flex gap-2">
                          <button type="button" disabled={busy} onClick={() => startSplit(it)} className="flex-1 bg-wine px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-chiffon transition-colors hover:bg-ink disabled:opacity-60">{busy ? "…" : "Start group gift"}</button>
                          <button type="button" onClick={() => setIntent(null)} className="border border-ink/20 px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-ink/60">Back</button>
                        </div>
                      </div>
                    ) : (
                      // Solo buy / already bought — confirm with name
                      <div className="space-y-2">
                        <p className="text-[0.64rem] uppercase tracking-[0.1em] text-wine">{intent === "bought" ? "Mark as already bought" : "Reserve to buy"}</p>
                        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                        <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" />
                        {err && <p className="text-[0.66rem] text-wine">{err}</p>}
                        <div className="flex gap-2">
                          <button type="button" disabled={busy} onClick={() => reserve(it)} className="flex-1 bg-ink px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">{busy ? "…" : "Confirm"}</button>
                          <button type="button" onClick={() => setIntent(null)} className="border border-ink/20 px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-ink/60">Back</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <button type="button" onClick={() => openGift(it.id)} className="w-full border border-ink/25 px-3 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine hover:text-wine">
                      Gift this
                    </button>
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-16 text-center text-[0.66rem] uppercase tracking-[0.18em] text-ink/35">
        Made with <a href="/registry" className="text-wine hover:underline">LOVEW Registry</a>
      </p>
    </main>
  );
}
