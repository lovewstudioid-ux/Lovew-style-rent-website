import { describe, expect, it } from "vitest";
import {
  COMMISSION_RATE,
  calcBookingPrice,
  calcCommission,
} from "./pricing";

describe("calcCommission", () => {
  it("takes 15% of the rental subtotal", () => {
    expect(COMMISSION_RATE).toBe(0.15);
    expect(calcCommission(1_000_000)).toBe(150_000);
  });

  it("rounds to whole rupiah", () => {
    expect(calcCommission(333_333)).toBe(50_000); // 49_999.95 → 50_000
  });
});

describe("calcBookingPrice", () => {
  it("sums lines by dailyRate × days × quantity", () => {
    const price = calcBookingPrice({
      lines: [
        { dailyRate: 250_000, days: 2 },
        { dailyRate: 100_000, days: 2, quantity: 3 },
      ],
    });
    expect(price.rentalSubtotal).toBe(500_000 + 600_000);
  });

  it("excludes shipping and deposit from commission", () => {
    const price = calcBookingPrice({
      lines: [{ dailyRate: 1_000_000, days: 1 }],
      shippingFee: 50_000,
      deposit: 500_000,
    });
    expect(price.commission).toBe(150_000); // 15% of 1_000_000 only
    expect(price.partnerPayout).toBe(850_000);
  });

  it("total = rentalSubtotal + shipping + deposit", () => {
    const price = calcBookingPrice({
      lines: [{ dailyRate: 1_000_000, days: 1 }],
      shippingFee: 50_000,
      deposit: 500_000,
    });
    expect(price.total).toBe(1_550_000);
  });

  it("defaults shipping and deposit to zero", () => {
    const price = calcBookingPrice({ lines: [{ dailyRate: 200_000, days: 1 }] });
    expect(price.shippingFee).toBe(0);
    expect(price.deposit).toBe(0);
    expect(price.total).toBe(200_000);
  });

  it("rejects invalid line input", () => {
    expect(() => calcBookingPrice({ lines: [{ dailyRate: 100, days: 0 }] })).toThrow();
    expect(() => calcBookingPrice({ lines: [{ dailyRate: -1, days: 1 }] })).toThrow();
    expect(() =>
      calcBookingPrice({ lines: [{ dailyRate: 100, days: 1, quantity: 0 }] }),
    ).toThrow();
  });
});
