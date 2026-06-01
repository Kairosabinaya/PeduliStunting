import { describe, expect, it } from "vitest";

import { TRACKER_VALIDATION_COPY } from "@/config/tracker";
import { todayIso } from "@/lib/today";

import {
  upsertChildImmunizationInputSchema,
  upsertChildMilestoneInputSchema,
} from "./health-plan";

const childId = "11111111-1111-4111-8111-111111111111";
const milestoneId = "22222222-2222-4222-8222-222222222222";
const childBirthDate = "2024-01-01";

function dateOffsetFromToday(days: number): string {
  const date = new Date(`${todayIso()}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("upsertChildImmunizationInputSchema", () => {
  it("rejects a future immunization date", () => {
    const parsed = upsertChildImmunizationInputSchema.safeParse({
      childId,
      childBirthDate,
      immunizationCode: "BCG",
      status: "done",
      givenAt: dateOffsetFromToday(1),
      note: null,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.givenAt).toContain(
        TRACKER_VALIDATION_COPY.futureDate,
      );
    }
  });

  it("rejects an immunization date before birth", () => {
    const parsed = upsertChildImmunizationInputSchema.safeParse({
      childId,
      childBirthDate,
      immunizationCode: "BCG",
      status: "done",
      givenAt: "2023-12-31",
      note: null,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.givenAt).toContain(
        TRACKER_VALIDATION_COPY.immunizationBeforeBirth,
      );
    }
  });
});

describe("upsertChildMilestoneInputSchema", () => {
  it("rejects a future milestone date", () => {
    const parsed = upsertChildMilestoneInputSchema.safeParse({
      childId,
      childBirthDate,
      milestoneId,
      status: "achieved",
      checkedAt: dateOffsetFromToday(1),
      note: null,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.checkedAt).toContain(
        TRACKER_VALIDATION_COPY.futureDate,
      );
    }
  });

  it("rejects a milestone date before birth", () => {
    const parsed = upsertChildMilestoneInputSchema.safeParse({
      childId,
      childBirthDate,
      milestoneId,
      status: "achieved",
      checkedAt: "2023-12-31",
      note: null,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.checkedAt).toContain(
        TRACKER_VALIDATION_COPY.milestoneBeforeBirth,
      );
    }
  });
});
