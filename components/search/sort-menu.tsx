"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Dictionary } from "@/lib/i18n";

interface SortMenuProps {
  t: Dictionary["catalog"]["browse"];
}

/** Sort dropdown that updates the `sort` URL param. */
export function SortMenu({ t }: SortMenuProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const current = params?.get("sort") ?? "relevance";

  return (
    <label className="flex items-center gap-2 text-sm text-charcoal/70">
      <span className="hidden sm:inline">{t.sortLabel}:</span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params?.toString() ?? "");
          if (e.target.value === "relevance") next.delete("sort");
          else next.set("sort", e.target.value);
          startTransition(() => router.replace(`/browse?${next.toString()}`, { scroll: false }));
        }}
        className="h-9 rounded-md border border-charcoal/20 bg-cream px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
      >
        <option value="relevance">{t.sortOptions.relevance}</option>
        <option value="price_asc">{t.sortOptions.priceAsc}</option>
        <option value="price_desc">{t.sortOptions.priceDesc}</option>
        <option value="newest">{t.sortOptions.newest}</option>
        <option value="rating">{t.sortOptions.rating}</option>
      </select>
    </label>
  );
}
