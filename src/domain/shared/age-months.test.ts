import { describe, expect, it } from "vitest";

import { asAgeMonths, monthsBetween } from "./age-months";
import { asDateOnly } from "./date-only";

describe("asAgeMonths", () => {
  it("accepts zero", () => {
    expect(asAgeMonths(0)).toBe(0);
  });

  it("accepts positive integers", () => {
    expect(asAgeMonths(60)).toBe(60);
  });

  it("rejects negative values", () => {
    expect(() => asAgeMonths(-1)).toThrow();
  });

  it("rejects non-integers", () => {
    expect(() => asAgeMonths(3.5)).toThrow();
  });
});

describe("monthsBetween", () => {
  it("returns 0 when reference equals birth", () => {
    expect(monthsBetween(asDateOnly("2024-03-15"), asDateOnly("2024-03-15"))).toBe(0);
  });

  it("returns 0 when the day-of-month has not been reached", () => {
    expect(monthsBetween(asDateOnly("2024-01-15"), asDateOnly("2024-08-14"))).toBe(6);
  });

  it("counts the full month once the day-of-month is reached", () => {
    expect(monthsBetween(asDateOnly("2024-01-15"), asDateOnly("2024-08-15"))).toBe(7);
  });

  it("handles year boundaries", () => {
    expect(monthsBetween(asDateOnly("2023-06-10"), asDateOnly("2025-06-10"))).toBe(24);
  });

  it("counts an incomplete final month correctly", () => {
    expect(monthsBetween(asDateOnly("2023-06-10"), asDateOnly("2025-06-09"))).toBe(23);
  });

  it("throws when reference precedes birth", () => {
    expect(() =>
      monthsBetween(asDateOnly("2024-06-10"), asDateOnly("2024-06-09")),
    ).toThrow();
  });
});
