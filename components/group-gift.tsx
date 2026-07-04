"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addContributions } from "@/app/actions/registry";
import { formatAmount, parseAmount, type Contribution, type RegistryItem } from "@/lib/registry";

const inputCls = "w-full border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

function totals(item: RegistryItem, contributions: Contribution[]) {
  const goal = parseAmount(item.price);
  const raised = contributions.reduce((s, c) => s + Number(c.amount || 0), 0);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  return { goal, raised, pct };
}

/* ─── Progress + contributor list (shared) ──────────────────────────────── */
function Progress({ item, contributions }: { item: RegistryItem; contributions: Contribution[] }) {
  const { goal, raised, pct } = totals(item, contributions);
  return (
    <>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#eee7e9]">
        <div className="h-full rounded-full bg-wine transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[0.78rem] font-medium text-wine">{formatAmount(raised, item.currency)} raised</span>
        <span className="text-[0.72rem] text-ink/50">
          {goal > 0 ? `${pct}% · ${formatAmount(Math.max(goal - raised, 0), item.currency)} to go` : `${contributions.length} in`}
        </span>
      </div>
      {contributions.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-ink/10 pt-3">
          {contributions.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-[0.78rem]">
              <span className="text-ink">{c.contributor_name}</span>
              <span className="text-ink/55">
                {formatAmount(Number(c.amount), item.currency)}{" "}
                <span className={c.paid ? "text-eucalyptus" : "text-ink/40"}>· {c.paid ? "paid" : "pledged"}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Owner-side read-only summary ──────────────────────────────────────── */
export function GroupGiftSummary({ item, contributions }: { item: RegistryItem; contributions: Contribution[] }) {
  return (
    <div className="mt-2 border border-wine/20 bg-[#fdf6f7] p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-wine">Group gift</p>
      <Progress item={item} contributions={contributions} />
    </div>
  );
}

/* ─── Guest-side interactive card ───────────────────────────────────────── */
export function GroupGiftPublic({
  item, contributions, slug, paymentNote,
}: {
  item: RegistryItem;
  contributions: Contribution[];
  slug: string;
  paymentNote: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "pick" | "mine" | "group">("none");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  // individual
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState(false);

  // organizer rows
  const [rows, setRows] = useState<{ name: string; amount: string }[]>([{ name: "", amount: "" }, { name: "", amount: "" }]);

  const runningTotal = rows.reduce((s, r) => s + parseAmount(r.amount), 0);

  async function submitMine() {
    if (!name.trim() || parseAmount(amount) <= 0) return setErr("Add your name and an amount.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("item_id", item.id);
    fd.append("slug", slug);
    fd.append("paid", String(paid));
    fd.append("contributor_name", name.trim());
    fd.append("amount", amount);
    const res = await addContributions(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    finish();
  }

  async function submitGroup() {
    const valid = rows.filter((r) => r.name.trim() && parseAmount(r.amount) > 0);
    if (valid.length === 0) return setErr("Add at least one name and amount.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("item_id", item.id);
    fd.append("slug", slug);
    fd.append("paid", "false");
    for (const r of valid) { fd.append("contributor_name", r.name.trim()); fd.append("amount", r.amount); }
    const res = await addContributions(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    finish();
  }

  function finish() {
    setDone(true); setMode("none");
    setName(""); setAmount(""); setPaid(false);
    setRows([{ name: "", amount: "" }, { name: "", amount: "" }]);
    router.refresh();
  }

  return (
    <div className="mt-auto pt-3">
      <div className="border border-wine/20 bg-[#fdf6f7] p-3">
        <p className="mb-2 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-wine">Group gift · give together</p>
        <Progress item={item} contributions={contributions} />

        {paymentNote && (
          <p className="mt-3 border-t border-wine/15 pt-2 text-[0.7rem] leading-relaxed text-ink/60">
            <span className="text-ink/45">Pay to:</span> {paymentNote}
          </p>
        )}

        {done && <p className="mt-3 text-[0.72rem] text-eucalyptus">Thank you — you&apos;re in! ✓</p>}

        {/* Actions */}
        {mode === "none" && (
          <button type="button" onClick={() => { setMode("pick"); setDone(false); }} className="mt-3 w-full bg-wine px-3 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-chiffon transition-colors hover:bg-ink">
            Give together
          </button>
        )}

        {mode === "pick" && (
          <div className="mt-3 space-y-2">
            <button type="button" onClick={() => setMode("mine")} className="w-full bg-ink px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-white transition-colors hover:bg-wine">Add my share</button>
            <button type="button" onClick={() => setMode("group")} className="w-full border border-ink/25 px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-ink transition-colors hover:border-wine hover:text-wine">Add everyone</button>
            <button type="button" onClick={() => setMode("none")} className="w-full py-1 text-[0.62rem] uppercase tracking-[0.12em] text-ink/45 hover:text-ink">Cancel</button>
          </div>
        )}

        {mode === "mine" && (
          <div className="mt-3 space-y-2">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <input className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount, e.g. 500.000" inputMode="numeric" />
            <label className="flex cursor-pointer items-center gap-2 text-[0.72rem] text-ink/60">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-3.5 w-3.5 accent-wine" />
              I&apos;ve already transferred it
            </label>
            {err && <p className="text-[0.66rem] text-wine">{err}</p>}
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={submitMine} className="flex-1 bg-wine px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-chiffon transition-colors hover:bg-ink disabled:opacity-60">{busy ? "…" : "Confirm"}</button>
              <button type="button" onClick={() => setMode("pick")} className="border border-ink/20 px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-ink/60">Back</button>
            </div>
          </div>
        )}

        {mode === "group" && (
          <div className="mt-3 space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} style={{ flex: 2 }} value={r.name} onChange={(e) => setRows((rs) => rs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Friend's name" />
                <input className={inputCls} style={{ flex: 1 }} value={r.amount} onChange={(e) => setRows((rs) => rs.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} placeholder="Amount" inputMode="numeric" />
              </div>
            ))}
            <button type="button" onClick={() => setRows((rs) => [...rs, { name: "", amount: "" }])} className="w-full border border-ink/15 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/60 hover:border-wine hover:text-wine">+ Add another friend</button>
            {runningTotal > 0 && (
              <p className="text-[0.72rem] text-ink/55">Logged: <span className="font-medium text-wine">{formatAmount(runningTotal, item.currency)}</span></p>
            )}
            {err && <p className="text-[0.66rem] text-wine">{err}</p>}
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={submitGroup} className="flex-1 bg-wine px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-chiffon transition-colors hover:bg-ink disabled:opacity-60">{busy ? "…" : "Save contributions"}</button>
              <button type="button" onClick={() => setMode("pick")} className="border border-ink/20 px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-ink/60">Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
