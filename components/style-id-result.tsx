"use client";

import { useRef, useState } from "react";
import type { StyleAnalysis } from "@/lib/style-id-prompts";
import { downloadPng, downloadPdf, shareCard } from "@/lib/card-export";
import { saveStyleIdResult } from "@/app/actions/style-id-save";

function Swatch({ name, hex, big }: { name: string; hex: string; big?: boolean }) {
  return (
    <div className="text-center">
      <div className={`mx-auto rounded-sm border border-ink/10 ${big ? "h-12 w-full" : "h-10 w-full"}`} style={{ backgroundColor: hex }} />
      <p className="mt-1 text-[0.6rem] leading-tight text-ink/60">{name}</p>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => <span key={t} className="border border-ink/15 px-2.5 py-1 text-[0.66rem] text-ink/70">{t}</span>)}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ink/10 pt-5">
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-wine">{title}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export function StyleIdResult({
  analysis,
  photo,
  name,
  demo,
  inquiry,
  onReset,
  photoFile,
  shared,
  savedSlug: savedSlugInitial,
}: {
  analysis: StyleAnalysis;
  photo: string;
  name: string;
  demo: boolean;
  inquiry: string;
  onReset?: () => void;
  photoFile?: File | null;
  shared?: boolean;
  savedSlug?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState("");
  const [slug, setSlug] = useState(savedSlugInitial ?? "");
  const [copied, setCopied] = useState(false);
  const first = name.trim().split(" ")[0] || "Your";
  const fname = `lovew-style-id-${first.toLowerCase()}`;
  const link = slug ? `lovew.studio/s/${slug}` : "";

  async function run(kind: string, fn: () => Promise<unknown>) {
    setBusy(kind);
    try { await fn(); } finally { setBusy(""); }
  }
  async function save() {
    if (!photoFile) return;
    await run("save", async () => {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("analysis", JSON.stringify(analysis));
      fd.append("photo", photoFile);
      const res = await saveStyleIdResult(fd);
      if (res.ok && res.slug) setSlug(res.slug);
    });
  }
  async function copy() {
    try { await navigator.clipboard.writeText(`https://${link}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* */ }
  }

  const btn = "inline-flex items-center justify-center gap-2 px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] transition-colors disabled:opacity-60";

  return (
    <div className="mx-auto w-full max-w-md">
      {/* ---- Capturable card ---- */}
      <div ref={cardRef} className="border border-ink/12 bg-white p-6 md:p-7">
        <div className="text-center">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-wine">LOVEW · Style ID</p>
          <h2 className="mt-2 font-display text-2xl font-normal text-ink">{first}&apos;s colours</h2>
          <p className="mt-1 font-display text-4xl font-normal text-wine">{analysis.season}</p>
        </div>

        <div className="mt-5 flex gap-4">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="h-28 w-24 flex-shrink-0 rounded-sm border border-ink/10 object-cover" crossOrigin="anonymous" />
          )}
          <div className="flex flex-col justify-center gap-2">
            <Chips items={[analysis.undertone, analysis.contrast, analysis.vibe].filter(Boolean)} />
            <p className="text-[0.78rem] font-light leading-relaxed text-ink/65">{analysis.summary}</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {analysis.characteristics?.length > 0 && <Block title="Your characteristics"><Chips items={analysis.characteristics} /></Block>}
          <Block title="Your best colours"><div className="grid grid-cols-4 gap-2">{analysis.best_colors?.map((c) => <Swatch key={c.name + c.hex} name={c.name} hex={c.hex} big />)}</div></Block>
          <Block title="Colours to avoid"><div className="grid grid-cols-6 gap-1.5">{analysis.avoid_colors?.map((c) => <Swatch key={c.name + c.hex} name={c.name} hex={c.hex} />)}</div></Block>
          <Block title="Your neutrals"><div className="grid grid-cols-5 gap-1.5">{analysis.neutrals?.map((c) => <Swatch key={c.name + c.hex} name={c.name} hex={c.hex} />)}</div></Block>
          <Block title="Makeup">
            <dl className="space-y-1 text-[0.78rem]">
              <div className="flex justify-between"><dt className="text-ink/50">Lip</dt><dd className="text-ink">{analysis.makeup?.lip}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/50">Cheek</dt><dd className="text-ink">{analysis.makeup?.cheek}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/50">Eyes</dt><dd className="text-ink">{analysis.makeup?.eyes}</dd></div>
            </dl>
            <p className="mt-2 text-[0.7rem] text-ink/50">Best metals: <span className="text-ink">{analysis.metals?.join(" · ")}</span></p>
          </Block>
          {analysis.hijab ? (
            <Block title="Hijab">
              <p className="text-[0.7rem] text-ink/50">Shades</p><Chips items={analysis.hijab.colors} />
              <p className="mt-2 text-[0.7rem] text-ink/50">Styles</p><Chips items={analysis.hijab.styles} />
            </Block>
          ) : (
            <Block title="Hair">
              <p className="text-[0.7rem] text-ink/50">Colours</p><Chips items={analysis.hair?.colors ?? []} />
              <p className="mt-2 text-[0.7rem] text-ink/50">Styles</p><Chips items={analysis.hair?.styles ?? []} />
              {analysis.hair?.avoid?.length > 0 && <p className="mt-2 text-[0.66rem] text-ink/45">Avoid: {analysis.hair.avoid.join(", ")}</p>}
            </Block>
          )}
          <Block title="Glasses">
            <p className="text-[0.7rem] text-ink/50">Most flattering</p><Chips items={analysis.glasses?.best ?? []} />
            {analysis.glasses?.avoid?.length > 0 && <p className="mt-2 text-[0.66rem] text-ink/45">Avoid: {analysis.glasses.avoid.join(", ")}</p>}
          </Block>
        </div>

        {/* CTAs baked into the saved image */}
        <div className="mt-6 border-t border-ink/10 pt-4 text-center">
          {link && <p className="text-[0.62rem] uppercase tracking-[0.16em] text-wine">View: {link}</p>}
          <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-ink/40">Get yours free · lovew.studio/discover</p>
        </div>
      </div>

      {/* ---- Actions (not captured) ---- */}
      {demo && <p className="mt-4 text-center text-[0.7rem] font-light text-ink/45">Sample preview — your real analysis generates once the studio enables it.</p>}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => run("png", () => downloadPng(cardRef.current!, fname))} disabled={!!busy} className={`${btn} bg-ink text-white hover:bg-wine`}>{busy === "png" ? "…" : "Save image ↓"}</button>
        <button type="button" onClick={() => run("pdf", () => downloadPdf(cardRef.current!, fname))} disabled={!!busy} className={`${btn} border border-ink/20 text-ink hover:border-wine`}>{busy === "pdf" ? "…" : "Save PDF"}</button>
        <button type="button" onClick={() => run("share", () => shareCard(cardRef.current!, "My LOVEW Style ID", "I got my colour analysis on LOVEW — get yours free at lovew.studio/discover"))} disabled={!!busy} className={`${btn} border border-ink/20 text-ink hover:border-wine`}>{busy === "share" ? "…" : "Share / IG story"}</button>
        {!shared && (
          slug ? (
            <button type="button" onClick={copy} className={`${btn} border border-eucalyptus/50 text-eucalyptus`}>{copied ? "Copied ✓" : "Copy link"}</button>
          ) : (
            <button type="button" onClick={save} disabled={!!busy || !photoFile} className={`${btn} border border-ink/20 text-ink hover:border-wine`}>{busy === "save" ? "Saving…" : "Save link"}</button>
          )
        )}
        {shared && (
          <a href="/discover" className={`${btn} border border-ink/20 text-ink hover:border-wine`}>Get your own →</a>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <a href={inquiry} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.2em] text-wine underline-offset-4 hover:underline">Book a styling session →</a>
        {onReset && <button type="button" onClick={onReset} className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink">Start over</button>}
      </div>
    </div>
  );
}
