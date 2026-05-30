import { describe, expect, it } from "vitest";

import {
  computeImmunizationCellStatus,
  computeImmunizationProgress,
} from "./immunization-status";

describe("computeImmunizationCellStatus", () => {
  it("returns 'done' when record is done regardless of age", () => {
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: 2,
        childAgeMonths: 0,
        recordStatus: "done",
      }),
    ).toBe("done");
  });

  it("returns 'skipped' when record is skipped", () => {
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: 12,
        childAgeMonths: 15,
        recordStatus: "skipped",
      }),
    ).toBe("skipped");
  });

  it("returns 'future' when recommendation is more than 1 month ahead", () => {
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: 12,
        childAgeMonths: 6,
        recordStatus: null,
      }),
    ).toBe("future");
  });

  it("returns 'upcoming' when within ±1 month window and not yet done", () => {
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: 9,
        childAgeMonths: 8,
        recordStatus: null,
      }),
    ).toBe("upcoming");
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: 9,
        childAgeMonths: 10,
        recordStatus: "pending",
      }),
    ).toBe("upcoming");
  });

  it("returns 'missed' when overdue by more than one month", () => {
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: 4,
        childAgeMonths: 7,
        recordStatus: null,
      }),
    ).toBe("missed");
  });

  it("returns 'future' when recommendation is null (no schedule)", () => {
    expect(
      computeImmunizationCellStatus({
        recommendedAgeMonths: null,
        childAgeMonths: 12,
        recordStatus: null,
      }),
    ).toBe("future");
  });
});

describe("computeImmunizationProgress", () => {
  it("counts only vaccines due by age or with explicit record", () => {
    const result = computeImmunizationProgress(
      [
        { recommendedAgeMonths: 0, recordStatus: "done" },
        { recommendedAgeMonths: 2, recordStatus: "done" },
        { recommendedAgeMonths: 12, recordStatus: null },
        { recommendedAgeMonths: 4, recordStatus: "skipped" },
      ],
      6,
    );
    expect(result.due).toBe(3);
    expect(result.done).toBe(2);
  });

  it("returns zero for empty schedules", () => {
    expect(computeImmunizationProgress([], 12)).toEqual({ due: 0, done: 0 });
  });

  it("treats null recommended age as future unless record is explicit", () => {
    const result = computeImmunizationProgress(
      [
        { recommendedAgeMonths: null, recordStatus: null },
        { recommendedAgeMonths: null, recordStatus: "done" },
      ],
      24,
    );
    expect(result.due).toBe(1);
    expect(result.done).toBe(1);
  });
});
