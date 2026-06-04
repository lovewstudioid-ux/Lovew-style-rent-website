/**
 * Deposit escrow lifecycle.
 *
 * LOVEW holds the refundable deposit — it is escrow, never revenue, and is
 * never routed to the partner. Every movement must write a `deposit_ledger`
 * row (the ledger is service-role write-only; read-only to clients). The
 * refund auto-releases 3 days after the item is marked `returned`, unless a
 * `damage_claims` row is open against the booking.
 *
 * This module is pure domain logic: it decides *what* should happen. Persisting
 * ledger rows is the caller's job (service role).
 */

/** Days after `returned` before an un-claimed deposit auto-releases. */
export const AUTO_RELEASE_DELAY_DAYS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DepositStatus = "held" | "released" | "forfeited";

/** A single deposit ledger movement. Amounts are integer rupiah. */
export type DepositLedgerEntry =
  | { type: "hold"; amount: number; at: Date; bookingId: string }
  | { type: "release"; amount: number; at: Date; bookingId: string }
  | { type: "forfeit"; amount: number; at: Date; bookingId: string; claimId: string };

/** The date a deposit becomes eligible for auto-release. */
export function refundReleaseDate(returnedAt: Date): Date {
  return new Date(returnedAt.getTime() + AUTO_RELEASE_DELAY_DAYS * MS_PER_DAY);
}

export interface AutoReleaseInput {
  /** When the item was marked `returned`. */
  returnedAt: Date;
  /** Current time. */
  now: Date;
  /** Whether an unresolved damage claim is open against the booking. */
  hasOpenDamageClaim: boolean;
}

/**
 * Whether the deposit may auto-release now: the item is returned, the 3-day
 * window has elapsed, and no damage claim is open. An open claim blocks the
 * auto-release indefinitely until resolved.
 */
export function canAutoRelease({
  returnedAt,
  now,
  hasOpenDamageClaim,
}: AutoReleaseInput): boolean {
  if (hasOpenDamageClaim) return false;
  return now.getTime() >= refundReleaseDate(returnedAt).getTime();
}

/** Build the ledger entry recording the platform taking the deposit into escrow. */
export function holdEntry(
  bookingId: string,
  amount: number,
  at: Date,
): DepositLedgerEntry {
  assertPositive(amount);
  return { type: "hold", amount: Math.round(amount), at, bookingId };
}

/** Build the ledger entry recording a (full or partial) refund to the customer. */
export function releaseEntry(
  bookingId: string,
  amount: number,
  at: Date,
): DepositLedgerEntry {
  assertPositive(amount);
  return { type: "release", amount: Math.round(amount), at, bookingId };
}

/** Build the ledger entry recording a deposit forfeited to cover a damage claim. */
export function forfeitEntry(
  bookingId: string,
  claimId: string,
  amount: number,
  at: Date,
): DepositLedgerEntry {
  assertPositive(amount);
  return { type: "forfeit", amount: Math.round(amount), at, bookingId, claimId };
}

/** Net deposit still held: holds minus releases and forfeits. */
export function heldBalance(entries: DepositLedgerEntry[]): number {
  return entries.reduce((balance, entry) => {
    return entry.type === "hold" ? balance + entry.amount : balance - entry.amount;
  }, 0);
}

function assertPositive(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Deposit amount must be a positive number");
  }
}
