"use client";

import { useState } from "react";
import type { FashionListing } from "@/lib/fashion";
import { EnquireButton } from "@/components/enquire-button";

export function FashionGallery({ listings, customerName = "", customerPhone = "" }: { listings: FashionListing[]; customerName?: string; customerPhone?: string }) {
  const cats = ["All", ...Array.from(new Set(listings.map((l) => l.category)))];
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const shown = listings.filter((l) => {
    if (filter !== "All" && l.category !== filter) return false;
    if (!ql) return true;
    return [l.name, l.description, l.city, l.size, l.category, l.listing_type].filter(Boolean).join(" ").toLowerCase().includes(ql);
  });

  if (listings.length === 0) {
    return (
      <div className="border-t border-ink/10 pt-16 text-center">
        <p className="font-display text-2xl text-ink/40">No pieces listed yet.</p>
        <p className="mt-2 text-sm font-light text-ink/45">Have gowns or outfits to rent or sell? List them on LOVEW.</p>
        <a href="/fashion/list" className="mt-7 inline-flex items-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine">List your pieces →</a>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search — gown, kebaya, size, city…"
          className="w-full max-w-md border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine"
        />
      </div>
      {cats.length > 2 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-6">
          {cats.map((c) => (
            <button key={c} type="button" onClick={() => setFilter(c)} className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${filter === c ? "bg-wine text-chiffon" : "border border-ink/15 text-ink/65 hover:border-wine"}`}>{c}</button>
          ))}
        </div>
      )}
      {shown.length === 0 && <p className="mt-12 text-center text-sm font-light text-ink/45">No pieces match &ldquo;{q}&rdquo;. Try another search.</p>}
      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((s) => {
          return (
            <div key={s.id} className="group flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ef]">
                {s.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                )}
                <span className="absolute left-2 top-2 bg-white/90 px-2 py-0.5 text-[0.56rem] uppercase tracking-[0.12em] text-ink">{s.listing_type}</span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <h3 className="font-display text-base leading-tight text-ink">{s.name}</h3>
                {s.price && <p className="whitespace-nowrap text-sm text-ink/70">{s.price}</p>}
              </div>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">{[s.category, s.size, s.city].filter(Boolean).join(" · ")}</p>
              <div className="mt-3">
                <EnquireButton source="fashion" listingId={s.id} listingName={s.name} whatsapp={s.whatsapp} instagram={s.instagram} defaultName={customerName} defaultPhone={customerPhone} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
