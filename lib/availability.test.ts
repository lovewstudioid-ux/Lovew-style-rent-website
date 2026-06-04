import { describe, expect, it } from "vitest";
import {
  bookedDays,
  isAvailable,
  rangeLengthDays,
  rangesOverlap,
} from "./availability";

describe("rangesOverlap", () => {
  it("detects overlapping ranges (inclusive endpoints)", () => {
    expect(
      rangesOverlap(
        { start: "2026-05-21", end: "2026-05-23" },
        { start: "2026-05-23", end: "2026-05-25" },
      ),
    ).toBe(true);
  });

  it("treats adjacent (non-touching) ranges as free", () => {
    expect(
      rangesOverlap(
        { start: "2026-05-21", end: "2026-05-22" },
        { start: "2026-05-23", end: "2026-05-24" },
      ),
    ).toBe(false);
  });
});

describe("isAvailable", () => {
  const booked = [
    { start: "2026-05-21", end: "2026-05-23" },
    { start: "2026-06-01", end: "2026-06-02" },
  ];

  it("is false when the requested range hits a booking", () => {
    expect(isAvailable({ start: "2026-05-23", end: "2026-05-24" }, booked)).toBe(false);
  });

  it("is true when the requested range is clear", () => {
    expect(isAvailable({ start: "2026-05-24", end: "2026-05-26" }, booked)).toBe(true);
  });

  it("is true against no bookings", () => {
    expect(isAvailable({ start: "2026-05-24", end: "2026-05-26" }, [])).toBe(true);
  });
});

describe("bookedDays", () => {
  it("expands inclusive ranges into sorted unique ISO days", () => {
    expect(
      bookedDays([
        { start: "2026-05-21", end: "2026-05-23" },
        { start: "2026-05-22", end: "2026-05-22" },
      ]),
    ).toEqual(["2026-05-21", "2026-05-22", "2026-05-23"]);
  });
});

describe("rangeLengthDays", () => {
  it("counts inclusive days", () => {
    expect(rangeLengthDays({ start: "2026-05-21", end: "2026-05-23" })).toBe(3);
    expect(rangeLengthDays({ start: "2026-05-21", end: "2026-05-21" })).toBe(1);
  });
});
