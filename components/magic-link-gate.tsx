"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/app/actions/auth";

/** Studio-branded signed-out gate with a passwordless magic-link sign-in. */
export function MagicLinkGate({
  eyebrow,
  title,
  blurb,
  next,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  next: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("email", email.trim());
    fd.append("next", next);
    const res = await signInWithMagicLink(fd);
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: res.message ?? "Check your email." } : { ok: false, text: res.error });
  }

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-20 text-center md:py-28">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">{eyebrow}</p>
          <h1 className="mt-6 font-display text-5xl font-normal text-chiffon md:text-7xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-chiffon/80">{blurb}</p>
        </div>
      </section>

      <section className="mx-auto max-w-md px-6 py-16 md:py-24">
        <div className="border border-ink/12 bg-white p-8 shadow-sm">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Start free</p>
          <h2 className="mt-3 font-display text-3xl font-normal text-ink">Sign in to begin</h2>
          <p className="mt-2 text-sm font-light leading-relaxed text-ink/55">
            Enter your email and we&apos;ll send a one-tap sign-in link — no password.
          </p>

          {msg?.ok ? (
            <div className="mt-7 border border-eucalyptus/40 bg-[#f3f6f2] px-4 py-5 text-center">
              <p className="font-display text-lg text-ink">Link sent ✓</p>
              <p className="mt-1 text-sm font-light text-ink/60">{msg.text}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine"
              />
              {msg && !msg.ok && <p className="text-xs text-wine">{msg.text}</p>}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60"
              >
                {busy ? "Sending…" : "Email me a sign-in link →"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
