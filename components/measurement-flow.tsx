"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveComcard, deleteComcard, type Comcard } from "@/app/actions/comcard";
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

const MEASURE_KEYS = [...NUMERIC.map((f) => f.name), ...DROPS.map((f) => f.name)];

type View = "hub" | "form" | "done";

function comcardToVals(c: Comcard): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of MEASURE_KEYS) {
    const v = (c as unknown as Record<string, string | null>)[k];
    if (v) out[k] = v;
  }
  return out;
}

export function MeasurementFlow({
  name,
  onBack,
  comcards,
  ownMeasurements,
}: {
  name: string;
  onBack: () => void;
  comcards: Comcard[];
  ownMeasurements?: Record<string, string | null> | null;
}) {
  const router = useRouter();
  const ownFirst = name.split(" ")[0] || "Me";

  const [view, setView] = useState<View>("hub");
  const [editId, setEditId] = useState<string>(""); // "" = new card
  const [cardName, setCardName] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [exporting, setExporting] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));
  const bodyType = computeBodyType(vals.bust ?? "", vals.waist ?? "", vals.hips ?? "", vals.high_hip ?? "");
  const first = (cardName.trim().split(" ")[0]) || "Card";
  const fname = `lovew-comcard-${first.toLowerCase()}`;

  function openNew(prefillSelf: boolean) {
    setEditId("");
    setErr(""); setPhoto("");
    if (prefillSelf) {
      setCardName(name);
      const out: Record<string, string> = {};
      if (ownMeasurements) for (const [k, v] of Object.entries(ownMeasurements)) if (v) out[k] = v;
      setVals(out);
    } else {
      setCardName("");
      setVals({});
    }
    setView("form");
  }

  function openEdit(c: Comcard) {
    setEditId(c.id);
    setCardName(c.name);
    setVals(comcardToVals(c));
    setErr(""); setPhoto("");
    setView("form");
  }

  async function exportRun(kind: string, fn: () => Promise<unknown>) {
    setExporting(kind);
    try { await fn(); } finally { setExporting(""); }
  }
  function pickPhoto(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    setPhoto(URL.createObjectURL(f));
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    await deleteComcard(fd);
    router.refresh();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cardName.trim()) return setErr("Please enter a name for this card.");
    if (!vals.bust || !vals.waist || !vals.hips)
      return setErr("Bust, waist and hip are needed to read the body type.");
    setBusy(true); setErr("");
    const fd = new FormData();
    if (editId) fd.append("id", editId);
    fd.append("name", cardName.trim());
    for (const k of MEASURE_KEYS) fd.append(k, vals[k] ?? "");
    const res = await saveComcard(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    if (res.id) setEditId(res.id);
    router.refresh();
    setView("done");
  }

  /* ── HUB: list of comcards ──────────────────────────────────────── */
  if (view === "hub") {
    return (
      <div className="mx-auto w-full max-w-xl">
        <button type="button" onClick={onBack} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">← Style ID</button>
        <h3 className="mt-3 font-display text-3xl font-normal text-ink">Comcards</h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
          Make a measurement card for yourself — or for a friend. Each card reads its own body type and exports to share.
        </p>

        {comcards.length > 0 && (
          <div className="mt-6 space-y-2">
            {comcards.map((c) => (
              <div key={c.id} className="flex items-center gap-3 border border-ink/12 bg-white px-4 py-3">
                <button type="button" onClick={() => openEdit(c)} className="flex-1 text-left">
                  <p className="font-display text-lg text-ink">{c.name}</p>
                  {c.body_type && <p className="text-[0.72rem] uppercase tracking-[0.12em] text-wine">{c.body_type}</p>}
                </button>
                <button type="button" onClick={() => openEdit(c)} className="text-[0.66rem] uppercase tracking-[0.12em] text-ink/50 hover:text-wine">Open</button>
                <button type="button" onClick={() => remove(c.id)} aria-label="Delete card" className="text-ink/40 hover:text-wine">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => openNew(true)} className="border border-ink/15 bg-white p-5 text-left shadow-sm transition-colors hover:border-wine">
            <p className="font-display text-lg text-ink">My comcard</p>
            <p className="mt-1 text-[0.78rem] font-light text-ink/55">Your own measurements &amp; body type.</p>
          </button>
          <button type="button" onClick={() => openNew(false)} className="border border-dashed border-ink/25 bg-[#faf8f5] p-5 text-left transition-colors hover:border-wine">
            <p className="font-display text-lg text-ink">＋ New comcard for a friend</p>
            <p className="mt-1 text-[0.78rem] font-light text-ink/55">Type their name &amp; measurements.</p>
          </button>
        </div>
      </div>
    );
  }

  /* ── DONE: comcard result ───────────────────────────────────────── */
  if (view === "done") {
    return (
      <div className="mx-auto w-full max-w-md">
        <div ref={cardRef} className="border border-ink/12 bg-white p-7">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-wine">LOVEW · Comcard</p>
              <h2 className="mt-1 font-display text-2xl font-normal text-ink">{first}</h2>
            </div>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={first} crossOrigin="anonymous" className="h-20 w-16 rounded-sm border border-ink/10 object-cover" />
            )}
          </div>

          {bodyType && (
            <>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.25em] text-ink/40">Body type</p>
              <p className="mt-1 font-display text-3xl font-normal text-wine">{bodyType.type}</p>
              <p className="mt-1 text-[0.78rem] font-light leading-relaxed text-ink/60">{bodyType.note}</p>
            </>
          )}

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

          <p className="mt-5 border-t border-ink/10 pt-4 text-center text-[0.6rem] uppercase tracking-[0.22em] text-ink/40">lovew.studio · measurement card</p>
        </div>

        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)} />
        <button type="button" onClick={() => photoRef.current?.click()} className="mt-2 w-full text-center text-[0.68rem] uppercase tracking-[0.14em] text-ink/40 hover:text-wine">
          {photo ? "Change photo" : "+ Add photo (optional)"}
        </button>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => exportRun("png", () => downloadPng(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center bg-ink px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">{exporting === "png" ? "…" : "Image ↓"}</button>
          <button type="button" onClick={() => exportRun("pdf", () => downloadPdf(cardRef.current!, fname))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "pdf" ? "…" : "PDF"}</button>
          <button type="button" onClick={() => exportRun("share", () => shareCard(cardRef.current!, `${first}'s LOVEW Comcard`, "Measurement card from LOVEW — lovew.studio/discover"))} disabled={!!exporting} className="inline-flex items-center justify-center border border-ink/20 px-4 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine disabled:opacity-60">{exporting === "share" ? "…" : "Share"}</button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2">
          <button type="button" onClick={() => setView("form")} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">Edit measurements</button>
          <button type="button" onClick={() => setView("hub")} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">← All comcards</button>
        </div>
      </div>
    );
  }

  /* ── FORM: create / edit ────────────────────────────────────────── */
  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-xl border border-ink/12 bg-white p-7 shadow-sm md:p-9">
      <button type="button" onClick={() => setView("hub")} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">← Comcards</button>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">{editId ? "Edit comcard" : "New comcard"}</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
        Enter a name and measurements — we&apos;ll read the body type and make a shareable card.
      </p>

      <div className="mt-6">
        <label className={labCls}>Name on card</label>
        <input className={inputCls} value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="e.g. your name, or a friend's" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {NUMERIC.map((f) => (
          <div key={f.name}>
            <label className={labCls}>{f.label}</label>
            <input className={inputCls} value={vals[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder={f.ph} inputMode="numeric" />
          </div>
        ))}
        {DROPS.map((f) => (
          <div key={f.name}>
            <label className={labCls}>{f.label}</label>
            <select className={inputCls} value={vals[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
              <option value="">Select</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {bodyType && (
        <div className="mt-5 border border-wine/20 bg-[#fdf5f6] px-5 py-4">
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-wine">Body type preview</p>
          <p className="mt-1 font-display text-2xl text-ink">{bodyType.type}</p>
          <p className="mt-0.5 text-[0.78rem] font-light text-ink/55">{bodyType.note}</p>
        </div>
      )}

      {err && <p className="mt-4 text-xs text-wine">{err}</p>}
      <button type="submit" disabled={busy} className={`${btnCls} mt-6`}>
        {busy ? "Saving…" : "Save & see comcard →"}
      </button>
    </form>
  );
}
