"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithMagicLink } from "@/app/actions/auth";
import { saveProfile } from "@/app/actions/profile";
import { PhoneInput } from "@/components/phone-input";
import { GENDERS, COUNTRIES, CITIES, BIRTH_DAYS, BIRTH_MONTHS, BIRTH_YEARS } from "@/lib/options";
import { StyleIdResult } from "@/components/style-id-result";
import { MeasurementFlow } from "@/components/measurement-flow";
import type { StyleAnalysis } from "@/lib/style-id-prompts";

const INQUIRY = "https://tally.so/r/Gxd6ZL";

type Phase = "loading" | "result" | "error";

type Mode = "choose" | "guide" | "measure" | "saved";

const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";
const btnCls = "inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60";

export function StyleIdExperience({
  signedIn,
  email,
  name,
  savedResult,
  savedSlug,
  savedPhoto,
  savedMeasurements,
}: {
  signedIn: boolean;
  email: string;
  name: string;
  phone: string;
  savedResult?: StyleAnalysis | null;
  savedSlug?: string;
  savedPhoto?: string;
  savedMeasurements?: Record<string, string | null> | null;
}) {
  const profileComplete = signedIn && Boolean(name);
  if (!signedIn) return <Shell><SignInStep /></Shell>;
  if (!profileComplete) return <Shell><ProfileStep email={email} /></Shell>;
  return <Hub name={name} savedResult={savedResult} savedSlug={savedSlug} savedPhoto={savedPhoto} savedMeasurements={savedMeasurements} />;
}

/* ------------------------------------------------------------------- HUB */
function Hub({ name, savedResult, savedSlug, savedPhoto, savedMeasurements }: {
  name: string;
  savedResult?: StyleAnalysis | null;
  savedSlug?: string;
  savedPhoto?: string;
  savedMeasurements?: Record<string, string | null> | null;
}) {
  const [mode, setMode] = useState<Mode>(savedResult ? "saved" : "choose");
  const first = name.split(" ")[0] || "there";
  const backFromMode = savedResult ? "saved" : "choose";

  if (mode === "measure") return <MeasurementFlow name={name} onBack={() => setMode(backFromMode)} initialValues={savedMeasurements} />;

  if (mode === "saved" && savedResult) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-wine">Your Style ID</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => setMode("measure")} className="text-[0.66rem] uppercase tracking-[0.16em] text-ink/45 hover:text-wine">
              Body type & comcard
            </button>
            <button type="button" onClick={() => setMode("guide")} className="text-[0.66rem] uppercase tracking-[0.16em] text-ink/45 hover:text-wine">
              Redo analysis
            </button>
          </div>
        </div>
        <StyleIdResult
          analysis={savedResult}
          photo={savedPhoto ?? ""}
          name={first}
          demo={false}
          inquiry={INQUIRY}
          savedSlug={savedSlug}
          onReset={() => setMode("guide")}
        />
      </div>
    );
  }

  if (mode === "guide") {
    return (
      <Shell>
        <button type="button" onClick={() => setMode(backFromMode)} className="mb-3 text-[0.66rem] uppercase tracking-[0.18em] text-ink/45 hover:text-wine">
          {savedResult ? "← My Style ID" : "← Style ID"}
        </button>
        <Generator firstName={first} />
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Hi {first}</p>
      <h3 className="mb-6 font-display text-3xl font-normal text-ink">What would you like first?</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { eyebrow: "① Styling guide", title: "Colours & style", body: "Upload a selfie → your colour analysis, makeup, hair & glasses.", go: () => setMode("guide") },
          { eyebrow: "② Measurement", title: "Body type & comcard", body: "Save your measurements → your body type + a shareable comcard.", go: () => setMode("measure") },
        ].map((c) => (
          <button key={c.title} type="button" onClick={c.go} className="group border border-ink/12 bg-white p-6 text-left shadow-sm transition-colors hover:border-wine">
            <p className="text-[0.66rem] font-medium uppercase tracking-[0.22em] text-wine">{c.eyebrow}</p>
            <p className="mt-2 font-display text-xl text-ink">{c.title}</p>
            <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">{c.body}</p>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-ink/40 group-hover:text-wine">Start →</p>
          </button>
        ))}
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
      <p className="mt-5 text-center text-[0.7rem] font-light text-ink/45">You can browse freely — sign in only to generate your Style ID.</p>
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

/* -------------------------------------------------------------- GENERATOR */
function Generator({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [hijab, setHijab] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [demo, setDemo] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");
  const [err, setErr] = useState("");
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [fullPreview, setFullPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const fullRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please upload an image file.");
    if (f.size > 8 * 1024 * 1024) return setErr("Image is too large (max 8 MB).");
    setErr(""); setFile(f); setPreview(URL.createObjectURL(f));
  }
  function pickFull(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please upload an image file.");
    if (f.size > 8 * 1024 * 1024) return setErr("Image is too large (max 8 MB).");
    setErr(""); setFullFile(f); setFullPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (hijab === null) return setErr("Please tell us whether you wear hijab.");
    if (!file) return setErr("Please upload a selfie.");
    if (!consent) return setErr("Please tick the box to continue.");
    setErr(""); setPhase("loading");
    try {
      const fd = new FormData();
      fd.append("wearsHijab", String(hijab));
      fd.append("consent", String(consent));
      fd.append("selfie", file);
      if (fullFile) fd.append("fullbody", fullFile);
      const res = await fetch("/api/style-id", { method: "POST", body: fd });
      if (res.status === 401) { router.refresh(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDemo(data.status === "demo");
      setAnalysis(data.analysis as StyleAnalysis);
      if (data.slug) setSavedSlug(data.slug as string);
      setPhase("result");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("error");
    }
  }

  function reset() { setPhase(null); setAnalysis(null); setDemo(false); setSavedSlug(""); setErr(""); }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center border border-ink/12 bg-white px-7 py-20 text-center shadow-sm">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-ink/15 border-t-wine" />
        <p className="mt-6 font-display text-2xl text-ink">Reading your colours…</p>
        <p className="mt-2 text-sm font-light text-ink/55">Crafting your personal Style ID — about 30 seconds.</p>
      </div>
    );
  }
  if (phase === "result" && analysis) {
    return <StyleIdResult analysis={analysis} photo={preview} name={firstName} demo={demo} inquiry={INQUIRY} onReset={reset} photoFile={file} savedSlug={savedSlug || undefined} />;
  }
  if (phase === "error") {
    return (
      <div className="border border-ink/12 bg-white px-7 py-16 text-center shadow-sm">
        <p className="font-display text-2xl text-ink">Hmm, that didn&apos;t work.</p>
        <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-ink/55">{err}</p>
        <button type="button" onClick={reset} className={`${btnCls} mt-7`}>Try again →</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-ink/12 bg-white p-7 shadow-sm md:p-9">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Free · 1 photo</p>
      <h3 className="mt-3 font-display text-3xl font-normal text-ink">Hi {firstName} — get your Style ID</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">Your personal colour, makeup &amp; accessory analysis from one selfie.</p>

      <div className="mt-7 space-y-5">
        <div>
          <label className={labCls}>Do you wear hijab?</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: true, l: "Yes, I wear hijab" }, { v: false, l: "No" }].map((o) => (
              <button key={o.l} type="button" onClick={() => setHijab(o.v)} className={`border px-4 py-2.5 text-xs uppercase tracking-[0.1em] transition-colors ${hijab === o.v ? "border-wine bg-wine text-chiffon" : "border-ink/15 text-ink/65 hover:border-wine"}`}>{o.l}</button>
            ))}
          </div>
        </div>

        <div>
          <label className={labCls}>Your selfie</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Your selfie" className="h-16 w-16 flex-shrink-0 rounded-sm object-cover" />
            ) : (
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-2xl text-ink/30">＋</span>
            )}
            <span className="text-sm text-ink/60">
              {file ? <span className="text-ink">{file.name}</span> : "Tap to upload a clear, front-facing selfie"}
              <span className="mt-0.5 block text-[0.7rem] text-ink/40">Good light · no filter · face visible · JPG/PNG, max 8 MB</span>
            </span>
          </button>
        </div>

        <div>
          <label className={labCls}>Full-body photo <span className="text-ink/35">(optional · recommended)</span></label>
          <input ref={fullRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFull(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => fullRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
            {fullPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fullPreview} alt="Full body" className="h-16 w-16 flex-shrink-0 rounded-sm object-cover" />
            ) : (
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-2xl text-ink/30">＋</span>
            )}
            <span className="text-sm text-ink/60">
              {fullFile ? <span className="text-ink">{fullFile.name}</span> : "Add a full-body photo for better fit & outfit advice"}
              <span className="mt-0.5 block text-[0.7rem] text-ink/40">Optional · helps with body type & styling</span>
            </span>
          </button>
        </div>

        <label className="flex cursor-pointer items-start gap-3 pt-1">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-wine" />
          <span className="text-[0.72rem] font-light leading-relaxed text-ink/55">I agree that LOVEW Studio may use my photo to generate my Style ID and contact me with styling tips. I can opt out anytime.</span>
        </label>
      </div>

      {err && <p className="mt-4 text-xs text-wine">{err}</p>}
      <button type="submit" className={`${btnCls} mt-6`}>Reveal my Style ID →</button>
    </form>
  );
}
