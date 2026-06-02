import { describe, expect, it } from "vitest";

import {
  WHO_STANDARD_MAX_AGE_MONTHS,
  isAgeWithinWhoStandards,
} from "./who-standard-range";

describe("isAgeWithinWhoStandards", () => {
  it("accepts the full WHO Child Growth Standards window (0-60 months)", () => {
    expect(isAgeWithinWhoStandards(0)).toBe(true);
    expect(isAgeWithinWhoStandards(WHO_STANDARD_MAX_AGE_MONTHS)).toBe(true);
  });

  it("rejects ages beyond the supported window", () => {
    expect(isAgeWithinWhoStandards(WHO_STANDARD_MAX_AGE_MONTHS + 1)).toBe(
      false,
    );
    expect(isAgeWithinWhoStandards(72)).toBe(false);
  });

  it("rejects negative ages", () => {
    expect(isAgeWithinWhoStandards(-1)).toBe(false);
  });
});
