"use client";

import { useRef, useState } from "react";
import { submitListing } from "@/app/actions/fashion";
import { FASHION_CATEGORIES, LISTING_TYPES } from "@/lib/fashion";
import { PhoneInput } from "@/components/phone-input";
import { CITIES } from "@/lib/options";

export function FashionSubmitForm() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Gown");
  const [type, setType] = useState<string>("Rent");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");
  const [wa, setWa] = useState("");
  const [ig, setIg] = useState("");

  function pickFiles(list: FileList | null) {
    if (!list) return;
    setFiles(Array.from(list).filter((f) => f.type.startsWith("image/")).slice(0, 6));
    setErr("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Please enter the piece name.");
    if (!wa.trim() && !ig.trim()) return setErr("Add a WhatsApp number or Instagram.");
    if (files.length === 0) return setErr("Please add at least one photo.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("name", name.trim()); fd.append("category", category); fd.append("listing_type", type);
    fd.append("size", size.trim()); fd.append("price", price.trim()); fd.append("city", city.trim());
    fd.append("description", desc.trim()); fd.append("whatsapp", wa.trim()); fd.append("instagram", ig.trim());
    files.forEach((f) => fd.append("images", f));
    const res = await submitListing(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not submit.");
    setDone(true);
  }

  const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
  const lab = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";

  if (done) {
    return (
      <div className="mx-auto max-w-md border border-eucalyptus/40 bg-[#f3f6f2] px-6 py-12 text-center">
        <p className="font-display text-3xl text-ink">Submitted ✓</p>
        <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-ink/60">Thank you! We&apos;ll review your piece and publish it on LOVEW Fashion within 1–2 days. Renters will reach you directly — no commission.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-2xl gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
      <div className="md:col-span-2"><label className={lab}>Piece name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aurora Champagne Gown" /></div>
      <div><label className={lab}>Category</label><select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>{FASHION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div><label className={lab}>Rent or buy?</label><select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>{LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
      <div><label className={lab}>Size <span className="text-ink/35">(optional)</span></label><input className={inputCls} value={size} onChange={(e) => setSize(e.target.value)} placeholder="S / M / fits 36–40" /></div>
      <div><label className={lab}>Price <span className="text-ink/35">(optional)</span></label><input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rp 450K / day" /></div>
      <div><label className={lab}>City</label><select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}><option value="">Select</option>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div className="md:col-span-2"><label className={lab}>Description <span className="text-ink/35">(optional)</span></label><textarea className={inputCls} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Fabric, condition, what's included…" /></div>
      <div><label className={lab}>WhatsApp</label><PhoneInput value={wa} onChange={setWa} /></div>
      <div><label className={lab}>Instagram</label><input className={inputCls} value={ig} onChange={(e) => setIg(e.target.value)} placeholder="@yourshop" /></div>
      <div className="md:col-span-2">
        <label className={lab}>Photos <span className="text-ink/35">(up to 6)</span></label>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => pickFiles(e.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-xl text-ink/30">＋</span>
          <span className="text-sm text-ink/60">{files.length ? <span className="text-ink">{files.length} photo{files.length > 1 ? "s" : ""} selected</span> : "Tap to add photos (max 8 MB each)"}</span>
        </button>
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={URL.createObjectURL(f)} alt="" className="h-16 w-16 rounded-sm object-cover" />
            ))}
          </div>
        )}
      </div>
      {err && <p className="md:col-span-2 text-xs text-wine">{err}</p>}
      <div className="md:col-span-2">
        <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">{busy ? "Submitting…" : "Submit my piece →"}</button>
        <p className="mt-3 text-center text-[0.7rem] font-light text-ink/45">Free to list. We review before publishing. Renters contact you directly — no commission.</p>
      </div>
    </form>
  );
}
