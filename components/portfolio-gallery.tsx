"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface Project {
  /** Display name in "Brand | Project" format, e.g. "OUI | May 2026" */
  name: string;
  cover?: string;
  images?: string[];
}

export interface PortfolioSection {
  key: string;
  label: string;
  blurb: string;
  services?: string[];
  occasions?: string[];
  projects: Project[];
}

const INITIAL_VISIBLE = 4;

export function PortfolioGallery({
  sections,
  inquiry,
}: {
  sections: PortfolioSection[];
  inquiry: string;
}) {
  const [open, setOpen] = useState<Project | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="space-y-20 md:space-y-28">
      {sections.map((section, i) => {
        const isExp = expanded[section.key];
        const shown = isExp ? section.projects : section.projects.slice(0, INITIAL_VISIBLE);
        const extra = section.projects.length - INITIAL_VISIBLE;
        return (
          <div key={section.key} id={section.key} className="scroll-mt-28">
            {/* Centered section header */}
            <div className="mx-auto max-w-2xl border-t border-ink/15 pt-10 text-center">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-wine">
                0{i + 1} · {section.projects.length} projects
              </p>
              <h3 className="mt-3 font-display text-4xl font-normal text-ink md:text-5xl">{section.label}</h3>
              <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed text-ink/60">{section.blurb}</p>
              {section.services && (
                <p className="mx-auto mt-5 max-w-lg text-[0.8rem] leading-relaxed text-ink/55">
                  {section.services.join("  ·  ")}
                </p>
              )}
              {section.occasions && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {section.occasions.map((o) => (
                    <span key={o} className="border border-ink/15 px-3 py-1 text-[0.68rem] uppercase tracking-[0.1em] text-ink/55">
                      {o}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-8">
                <a href={inquiry} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-ink px-7 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:bg-wine">
                  Start a project →
                </a>
              </div>
            </div>

            {/* Project cards */}
            <div className="mt-14">
              <div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
                  {shown.map((p) => {
                    const clickable = p.images && p.images.length > 0;
                    const Card = clickable ? "button" : "div";
                    return (
                      <Card
                        key={p.name}
                        {...(clickable ? { type: "button" as const, onClick: () => setOpen(p) } : {})}
                        className={`group text-left ${clickable ? "" : "cursor-default"}`}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#f1eee9]">
                          {p.cover ? (
                            <Image src={p.cover} alt={p.name} fill sizes="(min-width:768px) 28vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center px-4 text-center font-display text-lg text-ink/30">
                              {p.name.split("|")[0]}
                            </span>
                          )}
                          {clickable && (
                            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/30 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-white">View project →</span>
                            </span>
                          )}
                          {!clickable && (
                            <span className="absolute right-3 top-3 text-[0.55rem] uppercase tracking-[0.12em] text-ink/35">soon</span>
                          )}
                        </div>
                        <p className="mt-3 font-display text-base text-ink">{p.name}</p>
                      </Card>
                    );
                  })}
                </div>
                {extra > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [section.key]: !isExp }))}
                    className="mt-9 inline-flex items-center gap-2 border-b border-ink/30 pb-1.5 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-wine hover:text-wine"
                  >
                    {isExp ? "Show less" : `Show all ${section.projects.length} projects`} <span>{isExp ? "↑" : "↓"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Lightbox */}
      {open && open.images && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-white" onClick={() => setOpen(null)}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-white/95 px-6 py-5 backdrop-blur">
            <p className="font-display text-lg text-ink">{open.name}</p>
            <button type="button" onClick={() => setOpen(null)} className="text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-wine">
              Close ✕
            </button>
          </div>
          <div className="mx-auto max-w-4xl px-6 py-10" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              {open.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`${open.name} ${i + 1}`} className="w-full bg-[#f4f2ef]" loading={i < 2 ? "eager" : "lazy"} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href={inquiry} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine">
                Enquire about a project like this →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
