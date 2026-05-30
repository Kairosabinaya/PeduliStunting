import { describe, expect, it } from "vitest";

import type { PregnancyEventDto } from "@/application/pregnancy/dtos";
import type {
  PregnancyEventId,
  PregnancyId,
  UserId,
} from "@/domain/shared/ids";

import {
  buildAncSummary,
  buildOverview,
  buildTtdSummary,
  buildWeightSummary,
  computeGestationalAge,
  pickFetalMilestone,
  resolveTrimester,
} from "./pregnancy-status";

const event = (overrides: Partial<PregnancyEventDto>): PregnancyEventDto => ({
  id: "evt-1" as PregnancyEventId,
  userId: "user-1" as UserId,
  pregnancyId: "preg-1" as PregnancyId,
  kind: "anc_visit",
  eventDate: "2026-03-01",
  data: {},
  note: null,
  ...overrides,
});

describe("computeGestationalAge", () => {
  it("returns weeks + days from HPHT to reference date", () => {
    const age = computeGestationalAge("2026-01-01", "2026-01-22");
    expect(age.weeks).toBe(3);
    expect(age.days).toBe(0);
    expect(age.totalDays).toBe(21);
  });

  it("clamps to zero when reference date is before HPHT", () => {
    const age = computeGestationalAge("2026-05-01", "2026-04-01");
    expect(age.weeks).toBe(0);
    expect(age.totalDays).toBe(0);
  });
});

describe("resolveTrimester", () => {
  it("maps 0-12 to T1, 13-27 to T2, 28+ to T3", () => {
    expect(resolveTrimester(0)).toBe(1);
    expect(resolveTrimester(12)).toBe(1);
    expect(resolveTrimester(13)).toBe(2);
    expect(resolveTrimester(27)).toBe(2);
    expect(resolveTrimester(28)).toBe(3);
    expect(resolveTrimester(40)).toBe(3);
  });
});

describe("buildOverview", () => {
  it("derives gestational age, trimester, and days to due", () => {
    const overview = buildOverview("2026-01-01", "2026-10-08", "2026-04-01");
    expect(overview.gestational.weeks).toBe(12);
    expect(overview.trimester).toBe(1);
    expect(overview.daysToDueDate).toBeGreaterThan(180);
    expect(overview.progressFraction).toBeCloseTo(0.3, 1);
  });
});

describe("buildAncSummary", () => {
  it("aligns recorded events to slot numbers", () => {
    const events = [
      event({
        id: "1" as PregnancyEventId,
        kind: "anc_visit",
        data: { visit_number: 1, by_doctor: true, has_usg: true },
      }),
      event({
        id: "2" as PregnancyEventId,
        kind: "anc_visit",
        eventDate: "2026-06-01",
        data: { visit_number: 3, by_doctor: false, has_usg: false },
      }),
    ];
    const summary = buildAncSummary(events);
    expect(summary.target).toBe(6);
    expect(summary.completed).toBe(2);
    expect(summary.slots[0]?.recorded).toBe(true);
    expect(summary.slots[2]?.recorded).toBe(true);
    expect(summary.slots[3]?.recorded).toBe(false);
  });
});

describe("buildTtdSummary", () => {
  it("counts doses in the same month as reference", () => {
    const events = [
      event({
        id: "1" as PregnancyEventId,
        kind: "ttd_dose",
        eventDate: "2026-03-12",
      }),
      event({
        id: "2" as PregnancyEventId,
        kind: "ttd_dose",
        eventDate: "2026-03-20",
      }),
      event({
        id: "3" as PregnancyEventId,
        kind: "ttd_dose",
        eventDate: "2026-02-28",
      }),
    ];
    const summary = buildTtdSummary(events, "2026-03-25");
    expect(summary.dosesThisMonth).toBe(2);
    expect(summary.lastDose?.eventDate).toBe("2026-03-20");
  });
});

describe("buildWeightSummary", () => {
  it("computes gain vs initial weight", () => {
    const events = [
      event({
        id: "1" as PregnancyEventId,
        kind: "weight_measurement",
        eventDate: "2026-03-15",
        data: { weight_kg: 60 },
      }),
      event({
        id: "2" as PregnancyEventId,
        kind: "weight_measurement",
        eventDate: "2026-05-15",
        data: { weight_kg: 64 },
      }),
    ];
    const summary = buildWeightSummary(events, 58, 160);
    expect(summary.entries).toHaveLength(2);
    expect(summary.latest?.weightKg).toBe(64);
    expect(summary.currentGainKg).toBeCloseTo(6, 5);
    expect(summary.recommendation?.label).toContain("Normal");
  });

  it("returns null gain when initial weight missing", () => {
    const summary = buildWeightSummary([], null, null);
    expect(summary.currentGainKg).toBeNull();
    expect(summary.recommendation).toBeNull();
  });
});

describe("pickFetalMilestone", () => {
  it("finds the milestone for the supplied week", () => {
    expect(pickFetalMilestone(20)?.title).toContain("Trimester 2");
    expect(pickFetalMilestone(38)?.comparison).toContain("semangka");
  });

  it("returns null when no milestone covers the week", () => {
    expect(pickFetalMilestone(0)).toBeNull();
    expect(pickFetalMilestone(50)).toBeNull();
  });
});
