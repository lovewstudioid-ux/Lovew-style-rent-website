"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";

const CITIES: { value: string; label: string }[] = [
  { value: "jakarta", label: "Jakarta" },
  { value: "surabaya", label: "Surabaya" },
  { value: "bali", label: "Bali" },
  { value: "bandung", label: "Bandung" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORS: { value: string; hex: string }[] = [
  { value: "black", hex: "#1F1B16" },
  { value: "white", hex: "#FAF6F1" },
  { value: "cream", hex: "#EFE6D9" },
  { value: "beige", hex: "#D9C6A4" },
  { value: "champagne", hex: "#D9BC8C" },
  { value: "gold", hex: "#C9A44A" },
  { value: "rose", hex: "#D38B95" },
  { value: "pink", hex: "#E8B7C5" },
  { value: "red", hex: "#A8262D" },
  { value: "burgundy", hex: "#6B1F2A" },
  { value: "navy", hex: "#1F2A44" },
  { value: "blue", hex: "#3E6BB0" },
  { value: "green", hex: "#5E7A4B" },
  { value: "sage", hex: "#7A8B6F" },
  { value: "silver", hex: "#C7C6C2" },
  { value: "grey", hex: "#8B8780" },
];

interface FilterSidebarProps {
  t: Dictionary["catalog"]["filters"];
  hasSizingProfile: boolean;
}

/**
 * URL-driven filter panel. Every change calls router.replace with the new
 * query string; the /browse server component reads it on the next render.
 */
export function FilterSidebar({ t, hasSizingProfile }: FilterSidebarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    // Reset to first page whenever filters change.
    next.delete("page");
    startTransition(() => {
      router.replace(`/browse?${next.toString()}`, { scroll: false });
    });
  }

  function toggleArrayParam(key: string, value: string) {
    const current = new Set(params?.getAll(key) ?? []);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    const next = new URLSearchParams(params?.toString() ?? "");
    next.delete(key);
    current.forEach((v) => next.append(key, v));
    next.delete("page");
    startTransition(() => {
      router.replace(`/browse?${next.toString()}`, { scroll: false });
    });
  }

  function reset() {
    startTransition(() => router.replace("/browse", { scroll: false }));
  }

  const city = params?.get("city") ?? "";
  const start = params?.get("start") ?? "";
  const end = params?.get("end") ?? "";
  const size = params?.get("size") ?? "";
  const minPrice = params?.get("min_price") ?? "";
  const maxPrice = params?.get("max_price") ?? "";
  const fitsMine = params?.get("fits_my_size") === "1";
  const selectedCategories = new Set(params?.getAll("category") ?? []);
  const selectedOccasions = new Set(params?.getAll("occasion") ?? []);
  const selectedColors = new Set(params?.getAll("color") ?? []);

  return (
    <div className="space-y-7">
      {/* City */}
      <Section title={t.city}>
        <div className="space-y-1.5">
          {CITIES.map((c) => (
            <label key={c.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="city"
                value={c.value}
                checked={city === c.value}
                onChange={() => setParam("city", c.value)}
                className="h-4 w-4 border-charcoal/30 text-rose-gold focus:ring-rose-gold"
              />
              {c.label}
            </label>
          ))}
          {city ? (
            <button
              type="button"
              onClick={() => setParam("city", null)}
              className="text-xs text-rose-gold underline-offset-4 hover:underline"
            >
              Hapus
            </button>
          ) : null}
        </div>
      </Section>

      {/* Dates */}
      <Section title={t.dates}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-charcoal/60">{t.datesStart}</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setParam("start", e.target.value || null)}
              className="mt-1 h-9 w-full rounded-md border border-charcoal/20 bg-cream px-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-charcoal/60">{t.datesEnd}</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setParam("end", e.target.value || null)}
              className="mt-1 h-9 w-full rounded-md border border-charcoal/20 bg-cream px-2 text-sm"
            />
          </div>
        </div>
      </Section>

      {/* Category */}
      <Section title={t.category}>
        <div className="space-y-1.5">
          {Object.entries(t.categories).map(([key, label]) => (
            <Checkbox
              key={key}
              label={label}
              checked={selectedCategories.has(key)}
              onChange={() => toggleArrayParam("category", key)}
            />
          ))}
        </div>
      </Section>

      {/* Occasion */}
      <Section title={t.occasion}>
        <div className="space-y-1.5">
          {Object.entries(t.occasions).map(([key, label]) => (
            <Checkbox
              key={key}
              label={label}
              checked={selectedOccasions.has(key)}
              onChange={() => toggleArrayParam("occasion", key)}
            />
          ))}
        </div>
      </Section>

      {/* Color */}
      <Section title={t.color}>
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => {
            const active = selectedColors.has(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleArrayParam("color", c.value)}
                title={c.value}
                aria-pressed={active}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-transform",
                  active
                    ? "border-rose-gold scale-110"
                    : "border-charcoal/10 hover:border-charcoal/40",
                )}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </Section>

      {/* Size */}
      <Section title={t.size}>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setParam("size", active ? null : s)}
                aria-pressed={active}
                className={cn(
                  "h-8 min-w-10 rounded-full border px-3 text-xs",
                  active
                    ? "border-rose-gold bg-rose-gold text-cream"
                    : "border-charcoal/15 text-charcoal hover:border-charcoal/40",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          {hasSizingProfile ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fitsMine}
                onChange={() => setParam("fits_my_size", fitsMine ? null : "1")}
                className="h-4 w-4 rounded border-charcoal/30 text-rose-gold focus:ring-rose-gold"
              />
              {t.sizeUseMine}
            </label>
          ) : (
            <a href="/account/sizing" className="text-xs text-rose-gold hover:underline">
              {t.sizeNeedProfile}
            </a>
          )}
        </div>
      </Section>

      {/* Price */}
      <Section title={t.price}>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setParam("min_price", e.target.value || null)}
            className="h-9 w-full rounded-md border border-charcoal/20 bg-cream px-2 text-sm"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setParam("max_price", e.target.value || null)}
            className="h-9 w-full rounded-md border border-charcoal/20 bg-cream px-2 text-sm"
          />
        </div>
        <p className="mt-1 text-[11px] text-charcoal/50">
          {formatIDR(100000)} – {formatIDR(5000000)} {t.perDay}
        </p>
      </Section>

      <button
        type="button"
        onClick={reset}
        className="text-sm text-rose-gold hover:underline"
      >
        Reset filter
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-charcoal/60">
        {title}
      </p>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-charcoal/30 text-rose-gold focus:ring-rose-gold"
      />
      {label}
    </label>
  );
}
