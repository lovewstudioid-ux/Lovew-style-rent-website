"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n";

interface MobileFilterDrawerProps {
  t: Dictionary["catalog"];
  hasSizingProfile: boolean;
}

/** Mobile-only bottom-sheet wrapper around FilterSidebar. */
export function MobileFilterDrawer({ t, hasSizingProfile }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t.browse.filterButton}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-cream p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{t.browse.filterButton}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-soft-blush"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar t={t.filters} hasSizingProfile={hasSizingProfile} />
            <div className="sticky bottom-0 -mx-6 mt-6 border-t border-charcoal/10 bg-cream p-4">
              <Button onClick={() => setOpen(false)} className="w-full" size="lg">
                {t.browse.filterClose}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
