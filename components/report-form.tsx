"use client";

import { useState } from "react";
import { reportInquiry } from "@/app/actions/inquiries";

export function ReportForm({ refCode }: { refCode: string }) {
  const [outcome, setOutcome] = useState<"booked" | "lost" | null>(null);
  const [value, setValue] = useState("");
  const [reporter, setReporter] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome) return setErr("Please choose an outcome.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("ref", refCode);
    fd.append("outcome", outcome);
    fd.append("deal_value", value);
    fd.append("reported_by", reporter);
    const res = await reportInquiry(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    setDone(true);
  }

  const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  if (done) {
    return (
      <div className="mt-8 border border-eucalyptus/40 bg-[#f3f6f2] px-5 py-8 text-center">
        <p className="font-display text-xl text-ink">Thank you ✓</p>
        <p className="mt-1 text-sm font-light text-ink/60">LOVEW has recorded this outcome.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Did this enquiry turn into a deal?</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setOutcome("booked")} className={`border px-4 py-3 text-xs uppercase tracking-[0.12em] transition-colors ${outcome === "booked" ? "border-wine bg-wine text-chiffon" : "border-ink/15 text-ink/65 hover:border-wine"}`}>Yes, booked</button>
        <button type="button" onClick={() => setOutcome("lost")} className={`border px-4 py-3 text-xs uppercase tracking-[0.12em] transition-colors ${outcome === "lost" ? "border-wine bg-wine text-chiffon" : "border-ink/15 text-ink/65 hover:border-wine"}`}>No / didn&apos;t book</button>
      </div>

      {outcome === "booked" && (
        <div>
          <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Deal value (Rp)</label>
          <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 500000" inputMode="numeric" />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Your name <span className="text-ink/35">(optional)</span></label>
        <input className={inputCls} value={reporter} onChange={(e) => setReporter(e.target.value)} placeholder="Provider name" />
      </div>
      {err && <p className="text-xs text-wine">{err}</p>}
      <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">
        {busy ? "Saving…" : "Submit report →"}
      </button>
    </form>
  );
}
