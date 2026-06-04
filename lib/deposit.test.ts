import { describe, expect, it } from "vitest";
import {
  AUTO_RELEASE_DELAY_DAYS,
  canAutoRelease,
  forfeitEntry,
  heldBalance,
  holdEntry,
  refundReleaseDate,
  releaseEntry,
} from "./deposit";

const returnedAt = new Date("2026-05-21T00:00:00Z");

describe("refundReleaseDate", () => {
  it("is 3 days after the item is returned", () => {
    expect(AUTO_RELEASE_DELAY_DAYS).toBe(3);
    expect(refundReleaseDate(returnedAt).toISOString()).toBe("2026-05-24T00:00:00.000Z");
  });
});

describe("canAutoRelease", () => {
  it("holds the deposit before the 3-day window elapses", () => {
    expect(
      canAutoRelease({
        returnedAt,
        now: new Date("2026-05-23T23:59:00Z"),
        hasOpenDamageClaim: false,
      }),
    ).toBe(false);
  });

  it("releases once the window has elapsed and no claim is open", () => {
    expect(
      canAutoRelease({
        returnedAt,
        now: new Date("2026-05-24T00:00:00Z"),
        hasOpenDamageClaim: false,
      }),
    ).toBe(true);
  });

  it("never auto-releases while a damage claim is open", () => {
    expect(
      canAutoRelease({
        returnedAt,
        now: new Date("2026-06-01T00:00:00Z"),
        hasOpenDamageClaim: true,
      }),
    ).toBe(false);
  });
});

describe("ledger entries", () => {
  it("nets held balance across hold / release / forfeit", () => {
    const entries = [
      holdEntry("bk_1", 500_000, returnedAt),
      releaseEntry("bk_1", 300_000, returnedAt),
      forfeitEntry("bk_1", "claim_1", 200_000, returnedAt),
    ];
    expect(heldBalance(entries)).toBe(0);
  });

  it("rejects non-positive amounts", () => {
    expect(() => holdEntry("bk_1", 0, returnedAt)).toThrow();
    expect(() => releaseEntry("bk_1", -1, returnedAt)).toThrow();
  });
});
