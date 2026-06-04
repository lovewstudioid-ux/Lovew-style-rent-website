/**
 * Rental availability. A booking occupies an inclusive date range
 * [start, end] (the item is unavailable on both endpoints). Dates are ISO
 * "yyyy-mm-dd" strings or Date objects, compared at UTC day granularity.
 */

export interface DateRange {
  /** Inclusive start date (ISO "yyyy-mm-dd" or Date). */
  start: string | Date;
  /** Inclusive end date (ISO "yyyy-mm-dd" or Date). */
  end: string | Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse to a UTC-midnight epoch-day integer, stripping any time component. */
function toUtcDay(value: string | Date): number {
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.getTime();
  if (Number.isNaN(time)) {
    throw new Error(`Invalid date: ${String(value)}`);
  }
  return Math.floor(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ) / MS_PER_DAY,
  );
}

function normalize(range: DateRange): { start: number; end: number } {
  const start = toUtcDay(range.start);
  const end = toUtcDay(range.end);
  if (end < start) {
    throw new Error("Range end must be on or after start");
  }
  return { start, end };
}

/** True when two inclusive date ranges share at least one day. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  const ra = normalize(a);
  const rb = normalize(b);
  return ra.start <= rb.end && rb.start <= ra.end;
}

/** True when `requested` overlaps none of the already-booked ranges. */
export function isAvailable(requested: DateRange, booked: DateRange[]): boolean {
  return !booked.some((b) => rangesOverlap(requested, b));
}

/**
 * Expand booked ranges into the sorted, de-duplicated set of unavailable days
 * as ISO "yyyy-mm-dd" strings — handy for disabling dates in a calendar.
 */
export function bookedDays(booked: DateRange[]): string[] {
  const days = new Set<string>();
  for (const range of booked) {
    const { start, end } = normalize(range);
    for (let day = start; day <= end; day++) {
      days.add(new Date(day * MS_PER_DAY).toISOString().slice(0, 10));
    }
  }
  return [...days].sort();
}

/** Inclusive number of nights/days covered by a range (>= 1). */
export function rangeLengthDays(range: DateRange): number {
  const { start, end } = normalize(range);
  return end - start + 1;
}
