"use client";

import { useState } from "react";
import { saveStyleProfile } from "@/app/actions/style-profile";
import { TOP_SIZES, PANTS_SIZES, SHOE_SIZES } from "@/lib/options";

type Profile = Record<string, string | null> | null;

export function StyleProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const g = (k: string) => (profile?.[k] ?? "") as string;
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    if (!String(fd.get("weight_kg") ?? "").trim()) return setErr("Weight is required.");
    setBusy(true); setErr(""); setSaved(false);
    const res = await saveStyleProfile(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
  const lab = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";

  const Num = ({ name, label, ph, required }: { name: string; label: string; ph?: string; required?: boolean }) => (
    <div>
      <label className={lab}>{label}{required && <span className="text-wine"> *</span>}</label>
      <input name={name} defaultValue={g(name)} placeholder={ph} inputMode="numeric" className={inputCls} />
    </div>
  );
  const Drop = ({ name, label, options }: { name: string; label: string; options: readonly string[] }) => (
    <div>
      <label className={lab}>{label}</label>
      <select name={name} defaultValue={g(name)} className={inputCls}>
        <option value="">Select</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-14 text-center md:py-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">Style Profile</p>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-6xl">Your measurements</h1>
          <p className="mt-3 text-[0.78rem] text-chiffon/60">{email}</p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        <p className="text-sm font-light leading-relaxed text-ink/60">
          Save your sizing once — your name &amp; contact are already on your account. Share these with a provider so the fit is right.
        </p>
        <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
          <Num name="height_cm" label="Height (cm)" ph="165" />
          <Num name="weight_kg" label="Weight (kg)" ph="55" required />
          <Num name="bust" label="Bust / chest (cm)" ph="88" />
          <Num name="waist" label="Waist (cm)" ph="70" />
          <Num name="hips" label="Hip (cm)" ph="96" />
          <Num name="high_hip" label="High hip (cm)" ph="90" />
          <Drop name="top_size" label="Top size" options={TOP_SIZES} />
          <Drop name="pants_size" label="Pants size" options={PANTS_SIZES} />
          <Drop name="shoe_size" label="Shoe size (EU)" options={SHOE_SIZES} />
          <Num name="feet_length_cm" label="Feet length (cm)" ph="24" />
          <div className="md:col-span-2">
            <label className={lab}>Fit notes <span className="text-ink/35">(optional)</span></label>
            <textarea name="notes" defaultValue={g("notes")} rows={3} className={inputCls} placeholder="Prefer a looser fit, long arms, etc." />
          </div>
          {err && <p className="md:col-span-2 text-xs text-wine">{err}</p>}
          <div className="md:col-span-2 flex items-center gap-4">
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">
              {busy ? "Saving…" : "Save my measurements →"}
            </button>
            {saved && <span className="text-xs uppercase tracking-[0.16em] text-eucalyptus">Saved ✓</span>}
          </div>
        </form>
      </section>
    </>
  );
}
