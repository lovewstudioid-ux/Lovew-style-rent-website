/**
 * Authoritative pricing. Server-side code must recompute totals here and never
 * trust client-supplied totals.
 *
 * All money is integer rupiah. Commission is 15% of the rental subtotal only
 * (shipping and deposit are excluded). Deposit is escrow, not revenue — it is
 * included in what the customer pays now but is held, not earned. See
 * lib/deposit.ts for the deposit lifecycle.
 */

/** Platform commission rate on the rental subtotal. */
export const COMMISSION_RATE = 0.15;

export interface RentalLine {
  /** Daily rental rate in integer rupiah. */
  dailyRate: number;
  /** Number of rental days (inclusive of start, >= 1). */
  days: number;
  /** Quantity of this item. Defaults to 1. */
  quantity?: number;
}

export interface PriceInput {
  lines: RentalLine[];
  /** Shipping fee in integer rupiah. Excluded from commission. */
  shippingFee?: number;
  /** Refundable deposit in integer rupiah. Escrow — excluded from commission. */
  deposit?: number;
}

export interface PriceBreakdown {
  /** Sum of rental lines (dailyRate × days × quantity). */
  rentalSubtotal: number;
  shippingFee: number;
  deposit: number;
  /** Platform's cut of the rental subtotal (informational; not added to total). */
  commission: number;
  /** Amount paid to the partner: rentalSubtotal − commission. */
  partnerPayout: number;
  /** What the customer pays now: rentalSubtotal + shippingFee + deposit. */
  total: number;
}

function lineTotal(line: RentalLine): number {
  const quantity = line.quantity ?? 1;
  if (!Number.isFinite(line.dailyRate) || line.dailyRate < 0) {
    throw new Error("dailyRate must be a non-negative number");
  }
  if (!Number.isInteger(line.days) || line.days < 1) {
    throw new Error("days must be an integer >= 1");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("quantity must be an integer >= 1");
  }
  return Math.round(line.dailyRate) * line.days * quantity;
}

/** Commission on a rental subtotal, rounded to whole rupiah. */
export function calcCommission(rentalSubtotal: number): number {
  return Math.round(rentalSubtotal * COMMISSION_RATE);
}

/** Compute the full price breakdown for a booking. */
export function calcBookingPrice(input: PriceInput): PriceBreakdown {
  const rentalSubtotal = input.lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const shippingFee = Math.round(input.shippingFee ?? 0);
  const deposit = Math.round(input.deposit ?? 0);
  const commission = calcCommission(rentalSubtotal);

  return {
    rentalSubtotal,
    shippingFee,
    deposit,
    commission,
    partnerPayout: rentalSubtotal - commission,
    total: rentalSubtotal + shippingFee + deposit,
  };
}
