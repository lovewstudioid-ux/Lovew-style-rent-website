"use client";

import { useRef, useState } from "react";
import { downloadPng, downloadPdf, shareCard } from "@/lib/card-export";

const inputCls = "w-full border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1 block text-[0.66rem] uppercase tracking-[0.14em] text-ink/55";

/* Stat fields shown on the card. Some prefill from saved measurements. */
const STATS = [
  { key: "height", label: "Height", ph: "170 cm", from: "height_cm" },
  { key: "bust",   label: "Bust / chest", ph: "84 cm", from: "bust" },
  { key: "waist",  label: "Waist", ph: "62 cm", from: "waist" },
  { key: "hips",   label: "Hips", ph: "90 cm", from: "hips" },
  { key: "shoe",   label: "Shoe", ph: "39 EU", from: "shoe_size" },
  { key: "hair",   label: "Hair", ph: "Black" },
  { key: "eyes",   label: "Eyes", ph: "Dark brown" },
] as const;

type PhotoSlot = { url: string };

export function ModelComcard({
  name,
  onBack,
  ownMeasurements,
}: {
  name: string;
  onBack: () => void;
  ownMeasurements?: Record<string, string | null> | null;
}) {
  const first = name.split(" ")[0] || "Model";
  const [cardName, setCardName] = useState(name);
  const [tagline, setTagline] = useState(""); // e.g. agency / location / @instagram
  const [stats, setStats] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const s of STATS) {
      const src = (s as { from?: string }).from;
      const v = src && ownMeasurements ? ownMeasurements[src] : "";
      if (v) out[s.key] = String(v);
    }
    return out;
  });
  const [main, setMain] = useState<string>("");
  const [gallery, setGallery] = useState<PhotoSlot[]>([]);
  const [exporting, setExporting] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const fname = `lovew-model-comcard-${first.toLowerCase()}`;

  const setStat = (k: string, v: string) => setStats((s) => ({ ...s, [k]: v }));

  function pickMain(f: File | null) {
    if (!f || !f.type.startsWith("image/")) return;
    setMain(URL.createObjectURL(f));
  }
  function addGallery(files: FileList | null) {
    if (!files) return;
    const next: PhotoSlot[] = [];
    for (const f of Array.from(files)) {
      if (f.type.startsWith("image/") && gallery.length + next.length < 4) next.push({ url: URL.createObjectURL(f) });
    }
    setGallery((g) => [...g, ...next].slice(0, 4));
  }
  function removeGallery(i: number) {
    setGallery((g) => g.filter((_, j) => j !== i));
  }

  async function exportRun(kind: string, fn: () => Promise<unknown>) {
    setExporting(kind);
    try { await fn(); } finally { setExporting(""); }
  }

  const filledStats = STATS.filter((s) => stats[s.key]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button type="button" onClick={onBack} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">← Comcard</button>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Model comcard</h3>
      <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-ink/55">
        Build a modeling comp card — add your photos and stats, then download it as an image or PDF to send to agencies.
      </p>

      <div className="mt-7 grid gap-8 md:grid-cols-[1fr_1.05fr]">
        {/* ── Editor ─────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labCls}>Name on card</label>
              <input className={inputCls} value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className={labCls}>Agency / @handle <span className="text-ink/35">(optional)</span></label>
              <input className={inputCls} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="@yourhandle · Jakarta" />
            </div>
          </div>

          {/* Main photo */}
          <div>
            <label className={labCls}>Main photo</label>
            <input ref={mainRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickMain(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => mainRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
              {main ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={main} alt="" className="h-16 w-14 flex-shrink-0 rounded-sm object-cover" />
              ) : (
                <span className="flex h-16 w-14 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-xl text-ink/30">＋</span>
              )}
              <span className="text-sm text-ink/60">{main ? "Change main photo" : "Upload your main headshot / full body"}<span className="mt-0.5 block text-[0.7rem] text-ink/40">JPG/PNG</span></span>
            </button>
          </div>

          {/* Gallery photos */}
          <div>
            <label className={labCls}>More photos <span className="text-ink/35">(up to 4)</span></label>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addGallery(e.target.files)} />
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-sm border border-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeGallery(i)} aria-label="Remove" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[0.7rem] text-ink/60 hover:text-wine">✕</button>
                </div>
              ))}
              {gallery.length < 4 && (
                <button type="button" onClick={() => galleryRef.current?.click()} className="flex aspect-[3/4] items-center justify-center rounded-sm border border-dashed border-ink/25 bg-[#faf8f5] text-xl text-ink/30 hover:border-wine hover:text-wine">＋</button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div>
            <label className={labCls}>Stats</label>
            <div className="grid grid-cols-2 gap-2">
              {STATS.map((s) => (
                <input key={s.key} className={inputCls} value={stats[s.key] ?? ""} onChange={(e) => setStat(s.key, e.target.value)} placeholder={`${s.label} — ${s.ph}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Live comp card (exportable) ────────────────────── */}
        <div>
          <div ref={cardRef} className="border border-ink/12 bg-white p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-3xl font-normal text-ink">{cardName || first}</h2>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-wine">LOVEW</p>
            </div>
            {tagline && <p className="mt-0.5 text-[0.72rem] uppercase tracking-[0.14em] text-ink/45">{tagline}</p>}

            {/* Main photo */}
            <div className="mt-4 aspect-[3/4] overflow-hidden bg-[#f1eee9]">
              {main ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={main} alt={cardName} crossOrigin="anonymous" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[0.7rem] uppercase tracking-[0.14em] text-ink/30">Main photo</div>
              )}
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {gallery.map((g, i) => (
                  <div key={i} className="aspect-[3/4] overflow-hidden bg-[#f1eee9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt="" crossOrigin="anonymous" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {filledStats.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-ink/10 pt-4">
                {filledStats.map((s) => (
                  <div key={s.key} className="flex justify-between border-b border-ink/5 pb-1">
                    <dt className="text-[0.7rem] uppercase tracking-[0.1em] text-ink/45">{s.label}</dt>
                    <dd className="text-[0.75rem] text-ink">{stats[s.key]}</dd>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 border-t border-ink/10 pt-3 text-center text-[0.58rem] uppercase tracking-[0.22em] text-ink/40">lovew.studio · comp card</p>
          </div>

          {/* Export */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => exportRun("png", () => downloadPng(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center bg-ink px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">{exporting === "png" ? "…" : "Image ↓"}</button>
            <button type="button" onClick={() => exportRun("pdf", () => downloadPdf(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "pdf" ? "…" : "PDF"}</button>
            <button type="button" onClick={() => exportRun("share", () => shareCard(cardRef.current!, `${first}'s comp card`, "My model comp card from LOVEW — lovew.studio/discover"))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "share" ? "…" : "Share"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
