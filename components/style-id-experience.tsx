"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithMagicLink } from "@/app/actions/auth";
import { saveProfile } from "@/app/actions/profile";
import { PhoneInput } from "@/components/phone-input";
import { GENDERS, COUNTRIES, CITIES, BIRTH_DAYS, BIRTH_MONTHS, BIRTH_YEARS } from "@/lib/options";
import { MeasurementFlow } from "@/components/measurement-flow";
import { ModelComcard } from "@/components/model-comcard";
import type { Comcard } from "@/app/actions/comcard";

const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";
const btnCls = "inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60";

export function StyleIdExperience({
  signedIn,
  email,
  name,
  savedMeasurements,
  comcards = [],
}: {
  signedIn: boolean;
  email: string;
  name: string;
  phone?: string;
  savedResult?: unknown;
  savedSlug?: string;
  savedPhoto?: string;
  savedMeasurements?: Record<string, string | null> | null;
  comcards?: Comcard[];
}) {
  const profileComplete = signedIn && Boolean(name);
  if (!signedIn) return <Shell><SignInStep /></Shell>;
  if (!profileComplete) return <Shell><ProfileStep email={email} /></Shell>;
  return <Hub name={name} savedMeasurements={savedMeasurements} comcards={comcards} />;
}

/* ------------------------------------------------------------------- HUB */
function Hub({ name, savedMeasurements, comcards }: {
  name: string;
  savedMeasurements?: Record<string, string | null> | null;
  comcards: Comcard[];
}) {
  const [mode, setMode] = useState<"choose" | "measure" | "model">("choose");
  const first = name.split(" ")[0] || "there";

  if (mode === "measure") return <MeasurementFlow name={name} onBack={() => setMode("choose")} comcards={comcards} ownMeasurements={savedMeasurements} />;
  if (mode === "model") return <ModelComcard name={name} onBack={() => setMode("choose")} onFillMeasurements={() => setMode("measure")} ownMeasurements={savedMeasurements} comcards={comcards} />;

  return (
    <Shell>
      <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Hi {first}</p>
      <h3 className="mb-6 font-display text-3xl font-normal text-ink">Build your comcard</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => setMode("measure")} className="group border border-ink/12 bg-white p-6 text-left shadow-sm transition-colors hover:border-wine">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.22em] text-wine">Measurement comcard</p>
          <p className="mt-2 font-display text-xl text-ink">Body type &amp; sizes</p>
          <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">Enter measurements → your body type + a clean card to download as image or PDF.</p>
          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-ink/40 group-hover:text-wine">Start →</p>
        </button>
        <button type="button" onClick={() => setMode("model")} className="group border border-ink/12 bg-white p-6 text-left shadow-sm transition-colors hover:border-wine">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.22em] text-wine">Model comcard</p>
          <p className="mt-2 font-display text-xl text-ink">Add your photos</p>
          <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">Build a modeling comp card with your photos + stats — ready to download &amp; send to agencies.</p>
          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-ink/40 group-hover:text-wine">Start →</p>
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-xl">{children}</div>;
}

/* ---------------------------------------------------------------- SIGN IN */
function SignInStep() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const fd = new FormData();
    fd.append("email", email.trim());
    fd.append("next", "/discover");
    const res = await signInWithMagicLink(fd);
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: res.message ?? "Check your email." } : { ok: false, text: res.error });
  }

  return (
    <div className="border border-ink/12 bg-white p-7 shadow-sm md:p-9">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Free · sign up to start</p>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Get your Style ID</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
        Create a free account once — then your name &amp; contact carry across everything, no re-typing.
      </p>

      <form action={signInWithGoogle} className="mt-7">
        <input type="hidden" name="next" value="/discover" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 border border-ink/20 bg-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-wine"
        >
          Continue with Google
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/10" /><span className="text-[0.66rem] uppercase tracking-[0.2em] text-ink/40">or</span><span className="h-px flex-1 bg-ink/10" />
      </div>

      {msg?.ok ? (
        <div className="border border-eucalyptus/40 bg-[#f3f6f2] px-4 py-5 text-center">
          <p className="font-display text-lg text-ink">Link sent ✓</p>
          <p className="mt-1 text-sm font-light text-ink/60">{msg.text}</p>
        </div>
      ) : (
        <form onSubmit={magic} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
          {msg && !msg.ok && <p className="text-xs text-wine">{msg.text}</p>}
          <button type="submit" disabled={busy} className={btnCls}>{busy ? "Sending…" : "Email me a sign-in link →"}</button>
        </form>
      )}
      <p className="mt-5 text-center text-[0.7rem] font-light text-ink/45">
        Already have a password?{" "}
        <a href="/sign-in?next=/discover" className="text-wine underline-offset-2 hover:underline">Sign in here</a>.
      </p>
      <p className="mt-1.5 text-center text-[0.7rem] font-light text-ink/45">You can browse freely — sign in only to generate your Style ID.</p>
    </div>
  );
}

/* ------------------------------------------------------------ PROFILE STEP */
function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ProfileStep({ email }: { email: string }) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({ country: "Indonesia" });
  const [phone, setPhone] = useState("");
  const [bd, setBd] = useState({ d: "", m: "", y: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.full_name?.trim()) return setErr("Please enter your full name.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("full_name", v.full_name.trim());
    fd.append("nick_name", v.nick_name ?? "");
    fd.append("phone", phone);
    fd.append("instagram", (v.instagram ?? "").replace(/^@/, ""));
    fd.append("gender", v.gender ?? "");
    fd.append("country", v.country ?? "");
    fd.append("city", v.city ?? "");
    fd.append("job_title", v.job_title ?? "");
    if (bd.d && bd.m && bd.y) {
      const mm = String(BIRTH_MONTHS.indexOf(bd.m) + 1).padStart(2, "0");
      fd.append("birth_date", `${bd.y}-${mm}-${String(bd.d).padStart(2, "0")}`);
    }
    const res = await saveProfile(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="border border-ink/12 bg-white p-7 shadow-sm md:p-9">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">One-time setup</p>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Create your profile</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">Saved once, reused everywhere — you&apos;ll never fill this again.</p>
      <div className="mt-7 grid grid-cols-2 gap-4">
        <div><label className={labCls}>Full name</label><input className={inputCls} value={v.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} placeholder="Full name" /></div>
        <div><label className={labCls}>Nickname</label><input className={inputCls} value={v.nick_name ?? ""} onChange={(e) => set("nick_name", e.target.value)} placeholder="What we'll call you" /></div>
        <div className="col-span-2"><label className={labCls}>Email</label><input className={`${inputCls} bg-[#faf8f5] text-ink/60`} value={email} readOnly /></div>
        <div className="col-span-2"><label className={labCls}>Phone number</label><PhoneInput value={phone} onChange={setPhone} /></div>
        <div className="col-span-2"><label className={labCls}>Instagram <span className="text-ink/35">(optional)</span></label><input className={inputCls} value={v.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="@username" /></div>
        <div className="col-span-2">
          <label className={labCls}>Birth date</label>
          <div className="grid grid-cols-3 gap-2">
            <select value={bd.d} onChange={(e) => setBd((s) => ({ ...s, d: e.target.value }))} className={inputCls}><option value="">Day</option>{BIRTH_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            <select value={bd.m} onChange={(e) => setBd((s) => ({ ...s, m: e.target.value }))} className={inputCls}><option value="">Month</option>{BIRTH_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
            <select value={bd.y} onChange={(e) => setBd((s) => ({ ...s, y: e.target.value }))} className={inputCls}><option value="">Year</option>{BIRTH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          </div>
        </div>
        <div><label className={labCls}>Gender</label><Select value={v.gender ?? ""} onChange={(x) => set("gender", x)} options={GENDERS} placeholder="Select" /></div>
        <div><label className={labCls}>Job title</label><input className={inputCls} value={v.job_title ?? ""} onChange={(e) => set("job_title", e.target.value)} placeholder="e.g. Designer" /></div>
        <div><label className={labCls}>Country</label><Select value={v.country ?? ""} onChange={(x) => set("country", x)} options={COUNTRIES} placeholder="Select" /></div>
        <div><label className={labCls}>City</label><Select value={v.city ?? ""} onChange={(x) => set("city", x)} options={CITIES} placeholder="Select" /></div>
      </div>
      {err && <p className="mt-4 text-xs text-wine">{err}</p>}
      <button type="submit" disabled={busy} className={`${btnCls} mt-6`}>{busy ? "Saving…" : "Save & continue →"}</button>
    </form>
  );
}
