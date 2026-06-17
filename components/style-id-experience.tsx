"use client";

import { useRef, useState } from "react";

const INQUIRY = "https://tally.so/r/Gxd6ZL";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Phase = "form" | "loading" | "result" | "error";

export function StyleIdExperience() {
  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hijab, setHijab] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [demo, setDemo] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please upload an image file.");
    if (f.size > 8 * 1024 * 1024) return setErr("Image is too large (max 8 MB).");
    setErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function validate(): string | null {
    if (!name.trim()) return "Please enter your name.";
    if (!EMAIL_RE.test(email)) return "Please enter a valid email.";
    if (hijab === null) return "Please tell us whether you wear hijab.";
    if (!file) return "Please upload a selfie.";
    if (!consent) return "Please tick the box to continue.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);
    setErr("");
    setPhase("loading");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("whatsapp", whatsapp.trim());
      fd.append("wearsHijab", String(hijab));
      fd.append("consent", String(consent));
      fd.append("selfie", file as File);
      const res = await fetch("/api/style-id", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      if (data.status === "demo") {
        setDemo(true);
        setResultUrl(preview); // show the uploaded selfie in the result frame
      } else {
        setDemo(false);
        setResultUrl(data.resultUrl);
      }
      setPhase("result");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("form");
    setResultUrl("");
    setDemo(false);
    setErr("");
  }

  const inputCls =
    "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* ---------------------------------------------------------------- FORM */}
      {phase === "form" && (
        <form onSubmit={submit} className="border border-ink/12 bg-white p-7 shadow-sm md:p-9">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Free · 1 photo</p>
          <h3 className="mt-3 font-display text-3xl font-normal text-ink">Get your Style ID</h3>
          <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
            Your personal colour, makeup, and accessory analysis — generated from one selfie.
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Email</label>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">
                WhatsApp <span className="text-ink/35">(optional)</span>
              </label>
              <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+62…" />
            </div>

            {/* Hijab toggle — picks the right analysis */}
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Do you wear hijab?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: true, l: "Yes, I wear hijab" },
                  { v: false, l: "No" },
                ].map((o) => (
                  <button
                    key={o.l}
                    type="button"
                    onClick={() => setHijab(o.v)}
                    className={`border px-4 py-2.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                      hijab === o.v ? "border-wine bg-wine text-chiffon" : "border-ink/15 text-ink/65 hover:border-wine"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Selfie upload */}
            <div>
              <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Your selfie</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine"
              >
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

            {/* Consent */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-wine"
              />
              <span className="text-[0.72rem] font-light leading-relaxed text-ink/55">
                I agree that LOVEW Studio may use my photo to generate my Style ID and contact me with styling tips. I can opt out anytime.
              </span>
            </label>
          </div>

          {err && <p className="mt-4 text-xs text-wine">{err}</p>}

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine"
          >
            Reveal my Style ID →
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- LOADING */}
      {phase === "loading" && (
        <div className="flex flex-col items-center border border-ink/12 bg-white px-7 py-20 text-center shadow-sm">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-ink/15 border-t-wine" />
          <p className="mt-6 font-display text-2xl text-ink">Reading your colours…</p>
          <p className="mt-2 text-sm font-light text-ink/55">Crafting your personal Style ID — this takes about 30 seconds.</p>
        </div>
      )}

      {/* -------------------------------------------------------------- RESULT */}
      {phase === "result" && (
        <div className="border border-ink/12 bg-white p-6 text-center shadow-sm md:p-8">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">
            {name ? `${name.split(" ")[0]}'s` : "Your"} Style ID
          </p>

          <div className="relative mx-auto mt-5 w-full max-w-xs overflow-hidden border border-ink/10 bg-[#f4f2ef]">
            {/* 9:16 frame */}
            <div className="aspect-[9/16] w-full">
              {resultUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resultUrl} alt="Your Style ID analysis" className="h-full w-full object-cover" />
              )}
            </div>
            {demo && (
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-ink/75 via-ink/10 to-transparent p-5 text-center">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-chiffon/90">Preview mode</p>
                <p className="mt-1 text-xs font-light leading-relaxed text-chiffon/80">
                  Your full AI colour-analysis poster appears here once the studio switches it on.
                </p>
              </div>
            )}
          </div>

          {demo ? (
            <p className="mx-auto mt-6 max-w-sm text-xs font-light leading-relaxed text-ink/50">
              This is a live preview of the experience. With the backend connected, you’d get a personalised editorial
              poster — your palette, lip &amp; cheek shades, best/worst colours, hijab or hair styles, and glasses — ready to download.
            </p>
          ) : (
            <a
              href={resultUrl}
              download="lovew-style-id.png"
              className="mt-6 inline-flex items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine"
            >
              Download my Style ID ↓
            </a>
          )}

          <div className="mt-5 flex flex-col items-center gap-3">
            <a
              href={INQUIRY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.2em] text-wine underline-offset-4 hover:underline"
            >
              Book a styling session →
            </a>
            <button type="button" onClick={reset} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">
              Start over
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------- ERROR */}
      {phase === "error" && (
        <div className="border border-ink/12 bg-white px-7 py-16 text-center shadow-sm">
          <p className="font-display text-2xl text-ink">Hmm, that didn’t work.</p>
          <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-ink/55">{err}</p>
          <button
            type="button"
            onClick={() => setPhase("form")}
            className="mt-7 inline-flex items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine"
          >
            Try again →
          </button>
        </div>
      )}
    </div>
  );
}
