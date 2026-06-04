"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/i18n";

export interface VariantOption {
  id: string;
  size_label: string;
  bust_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  shoulder_cm: number | null;
  length_cm: number | null;
  color: string | null;
}

export interface UserSizing {
  bust_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
}

interface DressActionsProps {
  dressId: string;
  variants: VariantOption[];
  /** Map of variantId → array of YYYY-MM-DD strings that are already unavailable. */
  unavailableByVariant: Record<string, string[]>;
  dailyPriceIdr: number;
  depositIdr: number;
  minDays: number;
  maxDays: number;
  userSizing: UserSizing | null;
  t: Dictionary["catalog"]["detail"];
  measurementLabels: Pick<
    Dictionary["account"]["sizing"],
    "bustLabel" | "waistLabel" | "hipLabel" | "shoulderLabel" | "lengthLabel" | "cmShort"
  >;
}

/**
 * Variant + date picker + "fits my size" + total + Book CTA. Client
 * component because all four pieces interact in real time.
 */
export function DressActions({
  dressId,
  variants,
  unavailableByVariant,
  dailyPriceIdr,
  depositIdr,
  minDays,
  maxDays,
  userSizing,
  t,
  measurementLabels,
}: DressActionsProps) {
  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const variant = variants.find((v) => v.id === variantId) ?? null;

  const days = useMemo(() => diffDaysInclusive(start, end), [start, end]);
  const subtotal = days > 0 ? dailyPriceIdr * days : 0;

  const conflict = useMemo(() => {
    if (!variantId || !start || !end || days <= 0) return false;
    const set = new Set(unavailableByVariant[variantId] ?? []);
    for (const d of eachDateInclusive(start, end)) {
      if (set.has(d)) return true;
    }
    return false;
  }, [variantId, start, end, days, unavailableByVariant]);

  const fits = useMemo(() => {
    if (!variant || !userSizing) return null;
    return fitsWithinTolerance(variant, userSizing, 3);
  }, [variant, userSizing]);

  const tooFew = days > 0 && days < minDays;
  const tooMany = days > 0 && days > maxDays;
  const valid = variantId && start && end && days >= minDays && days <= maxDays && !conflict;

  const checkoutHref =
    valid && variantId
      ? `/checkout?variant=${variantId}&start=${start}&end=${end}`
      : "#";

  return (
    <div className="space-y-6">
      {/* Variant chips */}
      <div className="space-y-2">
        <Label>{t.pickVariant}</Label>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const active = variantId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm transition-colors",
                  active
                    ? "border-rose-gold bg-rose-gold text-cream"
                    : "border-charcoal/15 text-charcoal hover:border-charcoal/40",
                )}
              >
                {v.size_label}
              </button>
            );
          })}
        </div>

        {/* Measurement table for the selected variant */}
        {variant ? (
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-charcoal/70 sm:grid-cols-3">
            {variant.bust_cm != null && (
              <li><span className="text-charcoal/50">{measurementLabels.bustLabel}:</span> {variant.bust_cm}{measurementLabels.cmShort}</li>
            )}
            {variant.waist_cm != null && (
              <li><span className="text-charcoal/50">{measurementLabels.waistLabel}:</span> {variant.waist_cm}{measurementLabels.cmShort}</li>
            )}
            {variant.hip_cm != null && (
              <li><span className="text-charcoal/50">{measurementLabels.hipLabel}:</span> {variant.hip_cm}{measurementLabels.cmShort}</li>
            )}
            {variant.shoulder_cm != null && (
              <li><span className="text-charcoal/50">{measurementLabels.shoulderLabel}:</span> {variant.shoulder_cm}{measurementLabels.cmShort}</li>
            )}
            {variant.length_cm != null && (
              <li><span className="text-charcoal/50">{measurementLabels.lengthLabel}:</span> {variant.length_cm}{measurementLabels.cmShort}</li>
            )}
          </ul>
        ) : null}

        {/* Fits-my-size pill */}
        {fits !== null ? (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              fits ? "bg-sage/10 text-sage" : "bg-rose-gold/10 text-rose-gold",
            )}
          >
            {fits ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {fits ? t.fits : t.maybeFits}
          </div>
        ) : null}
      </div>

      {/* Dates */}
      <div className="space-y-2">
        <Label>{t.pickDates}</Label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={start}
            min={todayIso()}
            onChange={(e) => setStart(e.target.value)}
            className="h-11 w-full rounded-md border border-charcoal/20 bg-cream px-3 text-sm"
          />
          <input
            type="date"
            value={end}
            min={start || todayIso()}
            onChange={(e) => setEnd(e.target.value)}
            className="h-11 w-full rounded-md border border-charcoal/20 bg-cream px-3 text-sm"
          />
        </div>
        {tooFew && (
          <p className="text-xs text-rose-gold">Minimal sewa {minDays} hari.</p>
        )}
        {tooMany && (
          <p className="text-xs text-rose-gold">Maksimal sewa {maxDays} hari.</p>
        )}
        {conflict && (
          <p className="text-xs text-rose-gold">{t.unavailable}</p>
        )}
      </div>

      {/* Live total */}
      {days > 0 ? (
        <div className="rounded-lg border border-charcoal/10 bg-soft-blush/40 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-charcoal/70">
              {days} hari × {formatIDR(dailyPriceIdr)}
            </span>
            <span className="font-medium text-charcoal">{formatIDR(subtotal)}</span>
          </div>
          {depositIdr > 0 ? (
            <div className="mt-1 flex items-center justify-between text-charcoal/60">
              <span>{t.depositLine}</span>
              <span>{formatIDR(depositIdr)}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button asChild={valid} size="lg" className="w-full" disabled={!valid}>
        {valid ? (
          <Link href={checkoutHref}>{t.bookNow}</Link>
        ) : (
          <span>{t.bookNow}</span>
        )}
      </Button>
    </div>
  );
}

// ---- helpers ---------------------------------------------------------------
function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function diffDaysInclusive(a: string, b: string): number {
  if (!a || !b) return 0;
  const s = new Date(a + "T00:00:00Z").getTime();
  const e = new Date(b + "T00:00:00Z").getTime();
  if (e < s) return 0;
  return Math.round((e - s) / 86_400_000) + 1;
}

function* eachDateInclusive(a: string, b: string) {
  const s = new Date(a + "T00:00:00Z");
  const e = new Date(b + "T00:00:00Z");
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    yield d.toISOString().slice(0, 10);
  }
}

function fitsWithinTolerance(
  v: VariantOption,
  u: UserSizing,
  tol: number,
): boolean {
  const checks: [number | null, number | null][] = [
    [v.bust_cm, u.bust_cm],
    [v.waist_cm, u.waist_cm],
    [v.hip_cm, u.hip_cm],
  ];
  for (const [variant, user] of checks) {
    if (variant == null || user == null) continue;
    if (Math.abs(Number(variant) - Number(user)) > tol) return false;
  }
  return true;
}
