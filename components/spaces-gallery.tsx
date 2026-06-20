"use client";

import { useState } from "react";
import type { SpaceListing } from "@/lib/spaces";

export function SpacesGallery({ listings }: { listings: SpaceListing[] }) {
  const types = ["All", ...Array.from(new Set(listings.map((l) => l.space_type)))];
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? listings : listings.filter((l) => l.space_type === filter);

  if (listings.length === 0) {
    return (
      <div className="border-t border-ink/10 pt-16 text-center">
        <p className="font-display text-2xl text-ink/40">No spaces listed yet.</p>
        <p className="mt-2 text-sm font-light text-ink/45">Own a studio or venue? Be the first to list it.</p>
        <a href="/spaces/list" className="mt-7 inline-flex items-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine">
          List your space →
        </a>
      </div>
    );
  }

  return (
    <>
      {types.length > 2 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-6">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                filter === t ? "bg-wine text-chiffon" : "border border-ink/15 text-ink/65 hover:border-wine"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => {
          const wa = s.whatsapp
            ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Hi! I'd like to check availability for ${s.name} via LOVEW Spaces.`)}`
            : null;
          const ig = s.instagram ? `https://instagram.com/${s.instagram}` : null;
          return (
            <div key={s.id} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f2ef]">
                {s.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                )}
                <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink">{s.space_type}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg text-ink">{s.name}</h3>
                  <span className="text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">{[s.area, s.city].filter(Boolean).join(", ")}</span>
                </div>
                {s.price_from && <p className="mt-1 text-sm text-ink/55">{s.price_from}</p>}
                {s.description && <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-ink/55">{s.description}</p>}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-wine hover:text-wine">
                      WhatsApp →
                    </a>
                  )}
                  {ig && (
                    <a href={ig} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-wine hover:text-wine">
                      Instagram →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
