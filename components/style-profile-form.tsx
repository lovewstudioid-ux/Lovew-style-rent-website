"use client";

import { useState } from "react";

import { saveStyleProfile } from "@/app/actions/style-profile";

type Profile = Record<string, string | null> | null;

export function StyleProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const g = (k: string) => (profile?.[k] ?? "") as string;
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setSaved(false);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const res = await saveStyleProfile(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
  const lab = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";

  function Field({ name, label, ph }: { name: string; label: string; ph?: string }) {
    return (
      <div>
        <label className={lab}>{label}</label>
        <input name={name} defaultValue={g(name)} placeholder={ph} className={inputCls} />
      </div>
    );
  }

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
          Save your sizing once. When you rent or shop a piece, you can share these with the provider so the fit is right.
        </p>
        <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
          <Field name="full_name" label="Name" ph="Your name" />
          <Field name="whatsapp" label="WhatsApp" ph="0813…" />
          <Field name="height_cm" label="Height (cm)" ph="165" />
          <Field name="weight_kg" label="Weight (kg)" ph="optional" />
          <Field name="bust" label="Bust / chest (cm)" ph="88" />
          <Field name="waist" label="Waist (cm)" ph="70" />
          <Field name="hips" label="Hips (cm)" ph="96" />
          <Field name="dress_size" label="Dress size" ph="S / M / 8" />
          <Field name="top_size" label="Top size" ph="M" />
          <Field name="bottom_size" label="Bottom size" ph="28 / M" />
          <Field name="shoe_size" label="Shoe size" ph="39" />
          <div className="md:col-span-2">
            <label className={lab}>Fit notes <span className="text-ink/35">(optional)</span></label>
            <textarea name="notes" defaultValue={g("notes")} rows={3} className={inputCls} placeholder="Prefer a looser fit, long arms, etc." />
          </div>
          {err && <p className="md:col-span-2 text-xs text-wine">{err}</p>}
          <div className="md:col-span-2 flex items-center gap-4">
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">
              {busy ? "Saving…" : "Save my profile →"}
            </button>
            {saved && <span className="text-xs uppercase tracking-[0.16em] text-eucalyptus">Saved ✓</span>}
          </div>
        </form>
      </section>
    </>
  );
}
