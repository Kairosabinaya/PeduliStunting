import { describe, expect, it } from "vitest";

import {
  computeMilestoneAlert,
  filterMilestonesByMode,
  isMilestoneInRange,
} from "./milestone-status";

const milestone = (
  id: string,
  min: number,
  max: number,
  domain: "gross_motor" | "fine_motor" | "language" | "social" = "gross_motor",
) => ({
  id,
  domain,
  minAgeMonths: min,
  maxAgeMonths: max,
});

describe("isMilestoneInRange", () => {
  it("returns true when child age falls inside the inclusive range", () => {
    expect(isMilestoneInRange(milestone("a", 3, 6), 4)).toBe(true);
    expect(isMilestoneInRange(milestone("a", 3, 6), 3)).toBe(true);
    expect(isMilestoneInRange(milestone("a", 3, 6), 6)).toBe(true);
  });

  it("returns false outside the range", () => {
    expect(isMilestoneInRange(milestone("a", 3, 6), 2)).toBe(false);
    expect(isMilestoneInRange(milestone("a", 3, 6), 7)).toBe(false);
  });
});

describe("computeMilestoneAlert", () => {
  it("returns shouldAlert=true when any in-range milestone is delayed", () => {
    const result = computeMilestoneAlert(
      [milestone("a", 3, 6), milestone("b", 3, 6)],
      [{ milestoneId: "a", status: "delayed" }],
      4,
    );
    expect(result.shouldAlert).toBe(true);
    expect(result.delayedCount).toBe(1);
    expect(result.totalInRange).toBe(2);
  });

  it("ignores delayed milestones outside the current range", () => {
    const result = computeMilestoneAlert(
      [milestone("a", 3, 6), milestone("b", 12, 18)],
      [{ milestoneId: "b", status: "delayed" }],
      4,
    );
    expect(result.shouldAlert).toBe(false);
    expect(result.delayedCount).toBe(0);
  });

  it("counts not_checked milestones separately", () => {
    const result = computeMilestoneAlert(
      [milestone("a", 3, 6), milestone("b", 3, 6)],
      [{ milestoneId: "a", status: "achieved" }],
      4,
    );
    expect(result.notCheckedCount).toBe(1);
    expect(result.shouldAlert).toBe(false);
  });

  it("returns zeros when no milestones overlap the child age", () => {
    const result = computeMilestoneAlert(
      [milestone("a", 12, 18), milestone("b", 24, 36)],
      [],
      6,
    );
    expect(result.totalInRange).toBe(0);
    expect(result.shouldAlert).toBe(false);
  });
});

describe("filterMilestonesByMode", () => {
  it("returns all milestones when mode is 'all'", () => {
    const all = filterMilestonesByMode(
      [milestone("a", 3, 6), milestone("b", 12, 18)],
      4,
      "all",
    );
    expect(all).toHaveLength(2);
  });

  it("returns only in-range milestones when mode is 'current'", () => {
    const current = filterMilestonesByMode(
      [milestone("a", 3, 6), milestone("b", 12, 18)],
      4,
      "current",
    );
    expect(current).toHaveLength(1);
    expect(current[0]?.id).toBe("a");
  });
});
