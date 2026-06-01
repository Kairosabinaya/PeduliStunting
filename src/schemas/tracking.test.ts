import { describe, expect, it } from "vitest";

import { TRACKER_VALIDATION_COPY } from "@/config/tracker";
import { todayIso } from "@/lib/today";

import {
  childFormInputSchema,
  recordMeasurementFormInputSchema,
} from "./tracking";

const childId = "11111111-1111-4111-8111-111111111111";
const birthDate = "2024-01-01";

function dateOffsetFromToday(days: number): string {
  const date = new Date(`${todayIso()}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("childFormInputSchema", () => {
  it("rejects a birth date in the future", () => {
    const parsed = childFormInputSchema.safeParse({
      name: "Aira",
      sex: "P",
      birthDate: dateOffsetFromToday(1),
      birthWeightKg: "",
      birthLengthCm: "",
      birthStatus: "term",
      gestationalAgeWeeks: "",
      notes: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.birthDate).toContain(
        TRACKER_VALIDATION_COPY.birthDateFuture,
      );
    }
  });

  it("rejects decimal gestational age instead of truncating it", () => {
    const parsed = childFormInputSchema.safeParse({
      name: "Aira",
      sex: "P",
      birthDate,
      birthWeightKg: "",
      birthLengthCm: "",
      birthStatus: "preterm",
      gestationalAgeWeeks: "30.5",
      notes: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.gestationalAgeWeeks).toContain(
        TRACKER_VALIDATION_COPY.integer,
      );
    }
  });
});

describe("recordMeasurementFormInputSchema", () => {
  const validBase = {
    childId,
    childBirthDate: birthDate,
    measuredAt: "2024-02-01",
    weightKg: "8.5",
    heightCm: "",
    measuredLying: "",
    headCircumferenceCm: "",
    muacCm: "",
    note: "",
  } as const;

  it("rejects a measurement date before birth", () => {
    const parsed = recordMeasurementFormInputSchema.safeParse({
      ...validBase,
      measuredAt: "2023-12-31",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.measuredAt).toContain(
        TRACKER_VALIDATION_COPY.measurementBeforeBirth,
      );
    }
  });

  it("rejects a measurement date in the future", () => {
    const parsed = recordMeasurementFormInputSchema.safeParse({
      ...validBase,
      measuredAt: dateOffsetFromToday(1),
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.measuredAt).toContain(
        TRACKER_VALIDATION_COPY.futureDate,
      );
    }
  });

  it("rejects malformed decimal inputs", () => {
    const parsed = recordMeasurementFormInputSchema.safeParse({
      ...validBase,
      weightKg: "1,2,3",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.weightKg).toContain(
        TRACKER_VALIDATION_COPY.malformedNumber,
      );
    }
  });

  it("rejects alphabetic numeric input", () => {
    const parsed = recordMeasurementFormInputSchema.safeParse({
      ...validBase,
      weightKg: "abc",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.weightKg).toContain(
        TRACKER_VALIDATION_COPY.malformedNumber,
      );
    }
  });
});
