import { describe, expect, it } from "vitest";

import type {
  ChildImmunizationDto,
  ImmunizationDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";

import { TrackerDashboardViewModelBuilder } from "./tracker-dashboard-view-model";

const child: ChildDto = {
  id: "child-1",
  userId: "user-1",
  name: "Aira",
  sex: "P",
  birthDate: "2024-01-01",
  birthWeightKg: null,
  birthLengthCm: null,
  gestationalAgeWeeks: null,
  notes: null,
};

const baseMeasurement: GrowthMeasurementDto = {
  id: "measurement-1",
  userId: "user-1",
  childId: child.id,
  measuredAt: "2024-02-01",
  weightKg: 4,
  heightCm: 54,
  measuredLying: null,
  headCircumferenceCm: 38,
  muacCm: null,
  zScores: {},
  sdClass: {},
  note: null,
};

const immunizationSchedule: readonly ImmunizationDto[] = [
  {
    code: "BCG",
    name: "BCG",
    doseNumber: 1,
    recommendedAgeMonths: 0,
    notes: null,
    prevents: null,
    displayOrder: 1,
  },
  {
    code: "DPT-1",
    name: "DPT-HB-Hib 1",
    doseNumber: 1,
    recommendedAgeMonths: 2,
    notes: null,
    prevents: null,
    displayOrder: 2,
  },
  {
    code: "MR",
    name: "MR",
    doseNumber: 1,
    recommendedAgeMonths: 9,
    notes: null,
    prevents: null,
    displayOrder: 3,
  },
];

const childImmunizations: readonly ChildImmunizationDto[] = [
  {
    id: "record-1",
    userId: "user-1",
    childId: child.id,
    immunizationCode: "BCG",
    status: "done",
    givenAt: "2024-01-02",
    note: null,
  },
];

const milestoneCatalog: readonly MilestoneDto[] = [
  {
    id: "milestone-current",
    code: "GM-001",
    domain: "gross_motor",
    minAgeMonths: 2,
    maxAgeMonths: 3,
    description: "Mengangkat kepala",
    sourceLabel: "Buku KIA",
    displayOrder: 1,
  },
  {
    id: "milestone-future",
    code: "GM-002",
    domain: "gross_motor",
    minAgeMonths: 9,
    maxAgeMonths: 12,
    description: "Berdiri",
    sourceLabel: "Buku KIA",
    displayOrder: 2,
  },
];

function buildModel(
  measurements: readonly GrowthMeasurementDto[],
  childAgeMonths = 3,
) {
  return new TrackerDashboardViewModelBuilder().build({
    child,
    childAgeMonths,
    measurements,
    immunizationSchedule,
    childImmunizations,
    milestoneCatalog,
    childMilestones: [
      {
        id: "milestone-record-1",
        userId: "user-1",
        childId: child.id,
        milestoneId: "milestone-current",
        status: "delayed",
        checkedAt: "2024-03-01",
        note: null,
      },
    ],
  });
}

describe("TrackerDashboardViewModelBuilder", () => {
  it("chooses the latest valid growth status per indicator", () => {
    const model = buildModel([
      {
        ...baseMeasurement,
        id: "older",
        measuredAt: "2024-02-01",
        zScores: { TB_U: -2.5, BB_TB: -1, BB_U: -0.5, LK_U: 0 },
        sdClass: {
          TB_U: "pendek",
          BB_TB: "normal",
          BB_U: "normal",
          LK_U: "normal",
        },
      },
      {
        ...baseMeasurement,
        id: "newer",
        measuredAt: "2024-03-01",
        zScores: { TB_U: -3.2, BB_TB: -2.4, BB_U: -1.5, LK_U: 0.2 },
        sdClass: {
          TB_U: "sangat_pendek",
          BB_TB: "kurus",
          BB_U: "normal",
          LK_U: "normal",
        },
      },
    ]);

    expect(model.latestMeasurement?.id).toBe("newer");
    expect(model.overallRiskLevel).toBe("urgent");
    expect(
      model.growthStatuses.find((item) => item.indicator === "TB_U")?.sdClass,
    ).toBe("sangat_pendek");
    expect(
      model.growthStatuses.find((item) => item.indicator === "BB_TB")?.sdClass,
    ).toBe("kurus");
  });

  it("buckets immunizations by their canonical cell status", () => {
    const model = buildModel([
      {
        ...baseMeasurement,
        zScores: { TB_U: 0 },
        sdClass: { TB_U: "normal" },
      },
    ]);

    expect(model.immunizationProgress).toEqual({ due: 2, done: 1 });
    // DPT-1 (recommended 2mo, child 3mo) is within the +/-1mo window -> "upcoming".
    expect(model.immunizationsUpcoming.map((item) => item.code)).toEqual([
      "DPT-1",
    ]);
    // MR (recommended 9mo, child 3mo) is more than a month away -> "future".
    expect(model.immunizationsFuture.map((item) => item.code)).toEqual(["MR"]);
    expect(model.immunizationsMissed).toEqual([]);
  });

  it("computes milestone alert only from the current age range", () => {
    const model = buildModel([]);

    expect(model.milestoneAlert.totalInRange).toBe(1);
    expect(model.milestoneAlert.delayedCount).toBe(1);
    expect(model.milestoneAlert.shouldAlert).toBe(true);
  });
});
