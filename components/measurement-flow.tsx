"use client";

import { useRef, useState } from "react";
import { saveMeasurement } from "@/app/actions/measurement";
import { computeBodyType } from "@/lib/body-type";
import { downloadPng, downloadPdf, shareCard } from "@/lib/card-export";
import { TOP_SIZES, PANTS_SIZES, SHOE_SIZES } from "@/lib/options";

const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";
const btnCls = "inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60";

const NUMERIC = [
  { name: "height_cm", label: "Height (cm)", ph: "158" },
  { name: "weight_kg", label: "Weight (kg)", ph: "50" },
  { name: "bust",      label: "Bust (cm)",   ph: "82" },
  { name: "waist",     label: "Waist (cm)",  ph: "65" },
  { name: "hips",      label: "Hip (cm)",    ph: "90" },
  { name: "high_hip",  label: "High hip (cm)", ph: "85" },
  { name: "feet_length_cm", label: "Feet length (cm)", ph: "24" },
];

const DROPS = [
  { name: "top_size",   label: "Top size",               options: TOP_SIZES },
  { name: "pants_size", label: "Pants size (US waist)",  options: PANTS_SIZES },
  { name: "shoe_size",  label: "Shoe size (EU)",         options: SHOE_SIZES },
] as const;

export function MeasurementFlow({ name, onBack, initialValues }: { name: string; onBack: () => void; initialValues?: Record<string, string | null> | null }) {
  const first = name.split(" ")[0] || "Your";
  const [vals, setVals] = useState<Record<string, string>>(() => {
    if (!initialValues) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(initialValues)) if (v) out[k] = v;
    return out;
  });
  const [photo, setPhoto] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [exporting, setExporting] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const fname = `lovew-comcard-${first.toLowerCase()}`;

  async function exportRun(kind: string, fn: () => Promise<unknown>) {
    setExporting(kind);
    try { await fn(); } finally { setExporting(""); }
  }

  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));
  const bodyType = computeBodyType(vals.bust ?? "", vals.waist ?? "", vals.hips ?? "");

  function pickPhoto(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    setPhoto(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vals.bust || !vals.waist || !vals.hips)
      return setErr("Bust, waist and hip are needed to read your body type.");
    setBusy(true); setErr("");
    const fd = new FormData();
    for (const f of NUMERIC) fd.append(f.name, vals[f.name] ?? "");
    for (const f of DROPS)   fd.append(f.name, vals[f.name] ?? "");
    const res = await saveMeasurement(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    setDone(true);
  }

  /* ── Comcard result ─────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div ref={cardRef} className="border border-ink/12 bg-white p-7">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-wine">LOVEW · Comcard</p>
              <h2 className="mt-1 font-display text-2xl font-normal text-ink">{first}</h2>
            </div>
            {/* Optional photo */}
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={first}
                crossOrigin="anonymous"
                className="h-20 w-16 rounded-sm border border-ink/10 object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 border border-dashed border-ink/20 bg-[#faf8f5] text-center text-[0.55rem] uppercase tracking-[0.1em] text-ink/40 transition-colors hover:border-wine hover:text-wine"
              >
                <span className="text-lg">＋</span>
                Add photo
              </button>
            )}
          </div>

          {/* Body type */}
          {bodyType && (
            <>
              <p className="font-display text-3xl font-normal text-wine">{bodyType.type}</p>
              <p className="mt-1 text-[0.78rem] font-light leading-relaxed text-ink/60">{bodyType.note}</p>
            </>
          )}

          {/* Measurements table */}
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-ink/10 pt-4 text-sm">
            {NUMERIC.filter((f) => vals[f.name]).map((f) => (
              <div key={f.name} className="flex justify-between border-b border-ink/5 pb-1.5">
                <dt className="text-[0.75rem] text-ink/50">{f.label.replace(/\s*\(.*\)/, "")}</dt>
                <dd className="text-[0.75rem] text-ink">
                  {vals[f.name]}{f.name.endsWith("_cm") || f.name === "bust" || f.name === "waist" || f.name === "hips" || f.name === "high_hip" ? " cm" : ""}
                  {f.name === "weight_kg" ? " kg" : ""}
                </dd>
              </div>
            ))}
            {DROPS.filter((f) => vals[f.name]).map((f) => (
              <div key={f.name} className="flex justify-between border-b border-ink/5 pb-1.5">
                <dt className="text-[0.75rem] text-ink/50">{f.label.replace(/\s*\(.*\)/, "")}</dt>
                <dd className="text-[0.75rem] text-ink">{vals[f.name]}</dd>
              </div>
            ))}
          </div>

          <p className="mt-5 border-t border-ink/10 pt-4 text-center text-[0.6rem] uppercase tracking-[0.22em] text-ink/40">
            lovew.studio · your measurement card
          </p>
        </div>

        {/* Hidden photo input (so button works) */}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
        />

        {!photo && (
          <p className="mt-2 text-center text-[0.68rem] text-ink/40">
            Tap <span className="text-ink/60">+ Add photo</span> on the card to add your picture
          </p>
        )}

        {/* Export buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => exportRun("png", () => downloadPng(cardRef.current!, fname))}
            disabled={!!exporting}
            className="inline-flex items-center justify-center bg-ink px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60"
          >
            {exporting === "png" ? "…" : "Image ↓"}
          </button>
          <button
            type="button"
            onClick={() => exportRun("pdf", () => downloadPdf(cardRef.current!, fname))}
            disabled={!!exporting}
            className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60"
          >
            {exporting === "pdf" ? "…" : "PDF"}
          </button>
          <button
            type="button"
            onClick={() => exportRun("share", () => shareCard(cardRef.current!, "My LOVEW Comcard", "My measurement card from LOVEW — lovew.studio/discover"))}
            disabled={!!exporting}
            className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60"
          >
            {exporting === "share" ? "…" : "Share"}
          </button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2">
          <button type="button" onClick={() => setDone(false)} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">
            Edit measurements
          </button>
          <button type="button" onClick={onBack} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">
            ← Back to Style ID
          </button>
        </div>
      </div>
    );
  }

  /* ── Measurement form ───────────────────────────────────────────── */
  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-xl border border-ink/12 bg-white p-7 shadow-sm md:p-9">
      <button type="button" onClick={onBack} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">
        ← Style ID
      </button>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Your measurements</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
        Saved to your profile — we&apos;ll read your body type and make a shareable comcard. Name &amp; contact come from your account.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-4">
        {/* Numeric fields */}
        {NUMERIC.map((f) => (
          <div key={f.name}>
            <label className={labCls}>{f.label}</label>
            <input
              className={inputCls}
              value={vals[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.ph}
              inputMode="numeric"
            />
          </div>
        ))}

        {/* Dropdown fields */}
        {DROPS.map((f) => (
          <div key={f.name}>
            <label className={labCls}>{f.label}</label>
            <select
              className={inputCls}
              value={vals[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
            >
              <option value="">Select</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Live body type preview */}
      {bodyType && (
        <div className="mt-5 border border-wine/20 bg-[#fdf5f6] px-5 py-4">
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-wine">Body type preview</p>
          <p className="mt-1 font-display text-2xl text-ink">{bodyType.type}</p>
          <p className="mt-0.5 text-[0.78rem] font-light text-ink/55">{bodyType.note}</p>
        </div>
      )}

      {err && <p className="mt-4 text-xs text-wine">{err}</p>}
      <button type="submit" disabled={busy} className={`${btnCls} mt-6`}>
        {busy ? "Saving…" : "See my body type & comcard →"}
      </button>
    </form>
  );
}
