"use client";

import { useRef, useState } from "react";
import { downloadPng, downloadPdf, shareCard } from "@/lib/card-export";
import type { Comcard } from "@/app/actions/comcard";

/**
 * Model comp card builder, matching the LOVEW [TALENT KIT] Canva templates:
 *  - Template 1: main photo + name/stats sidebar + 5-photo collage below
 *  - Template 2: 2×2 photo grid, name centred, stats row along the bottom
 *
 * Users only add photos — the stats come from their saved measurements
 * (profile or a saved comcard), so nothing is re-typed.
 */

const inputCls = "w-full border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1 block text-[0.66rem] uppercase tracking-[0.14em] text-ink/55";

type Source = Record<string, string | null> | null | undefined;

interface Stat { label: string; value: string }

/** Build the template's stat list from saved measurements — nothing re-typed. */
function statsFrom(src: Source): Stat[] {
  const g = (k: string) => (src?.[k] ? String(src[k]).trim() : "");
  const shoes = g("shoe_size")
    ? g("feet_length_cm") ? `${g("shoe_size")} | ${g("feet_length_cm")} cm` : g("shoe_size")
    : "";
  return [
    { label: "Height", value: g("height_cm") ? `${g("height_cm")} cm` : "" },
    { label: "Bust", value: g("bust") ? `${g("bust")} cm` : "" },
    { label: "Waist", value: g("waist") ? `${g("waist")} cm` : "" },
    { label: "Hips", value: g("hips") ? `${g("hips")} cm` : "" },
    { label: "Size", value: g("top_size") },
    { label: "Shoes", value: shoes },
  ].filter((s) => s.value);
}

/* ─── Photo slot (click to add / change; small ✕ to clear) ──────────────── */
function Slot({
  src, onPick, onClear, label, className = "",
}: {
  src: string | null;
  onPick: () => void;
  onClear: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#f1eee9] ${className}`}>
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={onClear} aria-label="Remove photo" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[0.65rem] text-ink/60 hover:text-wine" data-html2canvas-ignore>✕</button>
        </>
      ) : (
        <button type="button" onClick={onPick} className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink/30 transition-colors hover:text-wine">
          <span className="text-xl leading-none">＋</span>
          {label && <span className="text-[0.55rem] uppercase tracking-[0.12em]">{label}</span>}
        </button>
      )}
    </div>
  );
}

export function ModelComcard({
  name,
  onBack,
  onFillMeasurements,
  ownMeasurements,
  comcards = [],
}: {
  name: string;
  onBack: () => void;
  onFillMeasurements?: () => void;
  ownMeasurements?: Record<string, string | null> | null;
  comcards?: Comcard[];
}) {
  const first = name.split(" ")[0] || "Model";
  const [template, setTemplate] = useState<1 | 2>(1);
  const [sourceId, setSourceId] = useState<string>("profile"); // "profile" | comcard id
  const [cardName, setCardName] = useState(name);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [exporting, setExporting] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeSlot = useRef(0);

  const source: Source =
    sourceId === "profile"
      ? ownMeasurements
      : (comcards.find((c) => c.id === sourceId) as unknown as Record<string, string | null>) ?? null;
  const stats = statsFrom(source);
  const hasMeasurements = stats.length > 0;

  function chooseSource(id: string) {
    setSourceId(id);
    if (id !== "profile") {
      const c = comcards.find((x) => x.id === id);
      if (c?.name) setCardName(c.name);
    } else {
      setCardName(name);
    }
  }

  function pick(slot: number) {
    activeSlot.current = slot;
    fileRef.current?.click();
  }
  function onFile(f: File | null) {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setPhotos((p) => p.map((x, i) => (i === activeSlot.current ? url : x)));
  }
  function clear(slot: number) {
    setPhotos((p) => p.map((x, i) => (i === slot ? null : x)));
  }

  async function exportRun(kind: string, fn: () => Promise<unknown>) {
    setExporting(kind);
    try { await fn(); } finally { setExporting(""); }
  }
  const fname = `lovew-comcard-${(cardName.split(" ")[0] || first).toLowerCase()}-t${template}`;

  const slotProps = (i: number, label?: string, cls?: string) => ({
    src: photos[i], onPick: () => pick(i), onClear: () => clear(i), label, className: cls,
  });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button type="button" onClick={onBack} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">← Comcard</button>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Model comcard</h3>
      <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-ink/55">
        Just add your photos — your measurements fill in automatically. Pick a template, then download as image or PDF.
      </p>

      {/* Shared hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = ""; }} />

      <div className="mt-7 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        {/* ── Controls ───────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Template choice */}
          <div>
            <label className={labCls}>Template</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTemplate(1)} className={`border p-3 text-left transition-colors ${template === 1 ? "border-wine bg-[#fdf6f7]" : "border-ink/15 hover:border-wine"}`}>
                <span className="block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink">Template 1</span>
                <span className="mt-0.5 block text-[0.68rem] font-light text-ink/50">Main photo + collage</span>
              </button>
              <button type="button" onClick={() => setTemplate(2)} className={`border p-3 text-left transition-colors ${template === 2 ? "border-wine bg-[#fdf6f7]" : "border-ink/15 hover:border-wine"}`}>
                <span className="block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink">Template 2</span>
                <span className="mt-0.5 block text-[0.68rem] font-light text-ink/50">Photo grid</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labCls}>Name on card</label>
            <input className={inputCls} value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name" />
          </div>

          {/* Measurement source */}
          <div>
            <label className={labCls}>Measurements</label>
            {comcards.length > 0 ? (
              <select className={inputCls} value={sourceId} onChange={(e) => chooseSource(e.target.value)}>
                <option value="profile">My saved measurements</option>
                {comcards.map((c) => <option key={c.id} value={c.id}>Comcard · {c.name}</option>)}
              </select>
            ) : (
              <p className="border border-ink/12 bg-[#faf8f5] px-3 py-2.5 text-[0.78rem] text-ink/60">Pulled automatically from your saved measurements.</p>
            )}
            {hasMeasurements ? (
              <p className="mt-1.5 text-[0.68rem] text-ink/45">
                Auto-filled: {stats.map((s) => s.label).join(" · ")} — no re-typing needed.
              </p>
            ) : (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <p className="text-[0.68rem] text-wine">No measurements saved yet.</p>
                {onFillMeasurements && (
                  <button type="button" onClick={onFillMeasurements} className="text-[0.68rem] uppercase tracking-[0.12em] text-wine underline underline-offset-2 hover:text-ink">Fill measurements first →</button>
                )}
              </div>
            )}
          </div>

          <p className="text-[0.72rem] font-light leading-relaxed text-ink/45">
            Tap any photo slot on the card to add that photo. Template 1 uses six photos, Template 2 uses four.
          </p>

          {/* Export */}
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => exportRun("png", () => downloadPng(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center bg-ink px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">{exporting === "png" ? "…" : "Image ↓"}</button>
            <button type="button" onClick={() => exportRun("pdf", () => downloadPdf(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "pdf" ? "…" : "PDF"}</button>
            <button type="button" onClick={() => exportRun("share", () => shareCard(cardRef.current!, `${cardName || first} — comp card`, "Comp card made at LOVEW — lovew.studio/discover"))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "share" ? "…" : "Share"}</button>
          </div>
        </div>

        {/* ── Live card (exportable, 3:4) ────────────────────── */}
        <div className="mx-auto w-full max-w-[430px]">
          <div ref={cardRef} className="aspect-[3/4] w-full border border-ink/12 bg-white">
            {template === 1 ? (
              /* Template 1 — main photo, name/stats sidebar, 5-photo collage */
              <div className="flex h-full flex-col gap-[3%] p-[5%]">
                <div className="grid min-h-0 flex-[1.05] grid-cols-[1.15fr_1fr] gap-[4%]">
                  <Slot {...slotProps(0, "Main photo", "h-full")} />
                  <div className="flex min-w-0 flex-col pt-[2%]">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-ink/55">Lovew Studio</p>
                    <p className="mt-[6%] break-words font-display text-[1.55rem] font-medium uppercase leading-[1.05] tracking-[0.02em] text-ink">{cardName || "Name"}</p>
                    <div className="mt-[10%] space-y-[6%]">
                      {stats.map((s) => (
                        <p key={s.label} className="text-[0.62rem] tracking-[0.06em] text-ink"><span className="uppercase text-ink/80">{s.label}</span> <span className="text-ink/70">{s.value}</span></p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_1fr_1fr] grid-rows-2 gap-[3%]">
                  <Slot {...slotProps(1, "Photo", "row-span-2 h-full")} />
                  <Slot {...slotProps(2, "Photo", "h-full")} />
                  <Slot {...slotProps(3, "Photo", "h-full")} />
                  <Slot {...slotProps(4, "Photo", "h-full")} />
                  <Slot {...slotProps(5, "Photo", "h-full")} />
                </div>
              </div>
            ) : (
              /* Template 2 — 2×2 grid, centred name, stats row */
              <div className="flex h-full flex-col p-[5%]">
                <p className="text-center text-[0.55rem] uppercase tracking-[0.3em] text-ink/55">Lovew Studio</p>
                <div className="mt-[3%] grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[3%]">
                  <Slot {...slotProps(0, "Photo", "h-full")} />
                  <Slot {...slotProps(1, "Photo", "h-full")} />
                  <Slot {...slotProps(2, "Photo", "h-full")} />
                  <Slot {...slotProps(3, "Photo", "h-full")} />
                </div>
                <p className="mt-[4%] text-center font-display text-[1.05rem] font-medium uppercase tracking-[0.08em] text-ink">{cardName || "Name"}</p>
                {stats.length > 0 && (
                  <div className="mt-[3%] flex justify-between gap-1">
                    {stats.map((s) => (
                      <div key={s.label} className="min-w-0 text-center">
                        <p className="text-[0.5rem] font-medium uppercase tracking-[0.08em] text-ink">{s.label}</p>
                        <p className="mt-0.5 text-[0.52rem] text-ink/60">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-[0.66rem] text-ink/40">Tap a slot to add its photo · switch templates any time, photos stay</p>
        </div>
      </div>
    </div>
  );
}
