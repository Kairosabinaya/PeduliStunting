import { describe, expect, it } from "vitest";

import { vitAKapsulEligibility } from "./vit-a-eligibility";

const blue = {
  minAgeMonths: 6,
  maxAgeMonths: 11,
  calendarMonth: null,
} as const;
const feb = { minAgeMonths: 12, maxAgeMonths: 59, calendarMonth: 2 } as const;

describe("vitAKapsulEligibility", () => {
  it("allows a month-agnostic capsule any month within the age range", () => {
    expect(
      vitAKapsulEligibility({ ...blue, childAgeMonths: 8, currentMonth: 4 }),
    ).toBe("ok");
  });

  it("blocks a capsule outside the recommended age range", () => {
    expect(
      vitAKapsulEligibility({ ...feb, childAgeMonths: 6, currentMonth: 2 }),
    ).toBe("out_of_age");
  });

  it("blocks the red February capsule outside February", () => {
    expect(
      vitAKapsulEligibility({ ...feb, childAgeMonths: 24, currentMonth: 4 }),
    ).toBe("out_of_month");
  });

  it("allows the red February capsule during February", () => {
    expect(
      vitAKapsulEligibility({ ...feb, childAgeMonths: 24, currentMonth: 2 }),
    ).toBe("ok");
  });
});
