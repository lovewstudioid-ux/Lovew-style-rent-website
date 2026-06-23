"use client";

import { useRef, useState } from "react";
import { saveMeasurement } from "@/app/actions/measurement";
import { computeBodyType } from "@/lib/body-type";
import { downloadPng, downloadPdf, shareCard } from "@/lib/card-export";

const FIELDS: { name: string; label: string; ph?: string }[] = [
  { name: "height_cm", label: "Height (cm)", ph: "165" },
  { name: "weight_kg", label: "Weight (kg)", ph: "55" },
  { name: "bust", label: "Bust (cm)", ph: "88" },
  { name: "waist", label: "Waist (cm)", ph: "70" },
  { name: "hips", label: "Hip (cm)", ph: "96" },
  { name: "high_hip", label: "High hip (cm)", ph: "90" },
  { name: "top_size", label: "Top (XS/S/M…)", ph: "M" },
  { name: "pants_size", label: "Pants (28/29…)", ph: "28" },
  { name: "shoe_size", label: "Shoe size", ph: "39" },
  { name: "feet_length_cm", label: "Feet length (cm)", ph: "24" },
];

const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const btnCls = "inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60";

export function MeasurementFlow({ name, onBack }: { name: string; onBack: () => void }) {
  const first = name.split(" ")[0] || "Your";
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [exporting, setExporting] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const fname = `lovew-comcard-${first.toLowerCase()}`;
  async function exportRun(kind: string, fn: () => Promise<unknown>) { setExporting(kind); try { await fn(); } finally { setExporting(""); } }

  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));
  const bodyType = computeBodyType(vals.bust ?? "", vals.waist ?? "", vals.hips ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vals.bust || !vals.waist || !vals.hips) return setErr("Bust, waist and hip are needed to read your body type.");
    setBusy(true); setErr("");
    const fd = new FormData();
    for (const f of FIELDS) fd.append(f.name, vals[f.name] ?? "");
    const res = await saveMeasurement(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div ref={cardRef} className="border border-ink/12 bg-white p-7">
          <div className="text-center">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-wine">LOVEW · Comcard</p>
            <h2 className="mt-2 font-display text-2xl font-normal text-ink">{first}</h2>
            {bodyType && <p className="mt-1 font-display text-4xl font-normal text-wine">{bodyType.type}</p>}
          </div>
          {bodyType && <p className="mt-3 text-center text-[0.8rem] font-light leading-relaxed text-ink/60">{bodyType.note}</p>}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-ink/10 pt-5 text-sm">
            {FIELDS.filter((f) => vals[f.name]).map((f) => (
              <div key={f.name} className="flex justify-between border-b border-ink/5 pb-1.5">
                <dt className="text-ink/50">{f.label.replace(/\s*\(.*\)/, "")}</dt>
                <dd className="text-ink">{vals[f.name]}{/cm\)/.test(f.label) ? " cm" : ""}</dd>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-ink/10 pt-4 text-center text-[0.6rem] uppercase tracking-[0.22em] text-ink/40">lovew.studio · your measurement card</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => exportRun("png", () => downloadPng(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center bg-ink px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">{exporting === "png" ? "…" : "Image ↓"}</button>
          <button type="button" onClick={() => exportRun("pdf", () => downloadPdf(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "pdf" ? "…" : "PDF"}</button>
          <button type="button" onClick={() => exportRun("share", () => shareCard(cardRef.current!, "My LOVEW comcard", "My measurement card from LOVEW — lovew.studio/discover"))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "share" ? "…" : "Share"}</button>
        </div>
        <div className="mt-3 flex flex-col items-center gap-2">
          <button type="button" onClick={() => setDone(false)} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">Edit measurements</button>
          <button type="button" onClick={onBack} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">← Back to Style ID</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-xl border border-ink/12 bg-white p-7 shadow-sm md:p-9">
      <button type="button" onClick={onBack} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">← Style ID</button>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Your measurements</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">Saved to your profile — we&apos;ll read your body type and make a comcard. Name &amp; contact come from your account.</p>
      <div className="mt-7 grid grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">{f.label}</label>
            <input className={inputCls} value={vals[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder={f.ph} inputMode={/cm|size|\)/.test(f.label) ? "text" : "numeric"} />
          </div>
        ))}
      </div>
      {err && <p className="mt-4 text-xs text-wine">{err}</p>}
      <button type="submit" disabled={busy} className={`${btnCls} mt-6`}>{busy ? "Saving…" : "See my body type & comcard →"}</button>
    </form>
  );
}
