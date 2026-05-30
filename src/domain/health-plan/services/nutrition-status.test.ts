import { describe, expect, it } from "vitest";

import type { NutritionEventDto } from "@/application/health-plan/dtos";

import {
  latestEventOfKind,
  readAsiExclusiveStatus,
  readDewormingHistory,
  readMpasiStatus,
} from "./nutrition-status";

const event = (overrides: Partial<NutritionEventDto>): NutritionEventDto => ({
  id: "evt-1",
  userId: "user-1",
  childId: "child-1",
  kind: "asi_exclusive",
  eventDate: "2026-01-15",
  data: {},
  note: null,
  ...overrides,
});

describe("latestEventOfKind", () => {
  it("returns the most recent event for the kind", () => {
    const events: NutritionEventDto[] = [
      event({ id: "a", eventDate: "2026-01-10" }),
      event({ id: "b", eventDate: "2026-03-05" }),
      event({ id: "c", eventDate: "2026-02-01", kind: "mpasi_started" }),
    ];
    const result = latestEventOfKind(events, "asi_exclusive");
    expect(result?.id).toBe("b");
  });

  it("returns null when no event matches the kind", () => {
    const events = [event({ kind: "mpasi_started" })];
    expect(latestEventOfKind(events, "asi_exclusive")).toBeNull();
  });
});

describe("readAsiExclusiveStatus", () => {
  it("returns null state when no event recorded", () => {
    expect(readAsiExclusiveStatus([])).toEqual({
      latest: null,
      exclusive: null,
    });
  });

  it("reads the boolean from the latest event data", () => {
    const events = [
      event({ eventDate: "2026-01-01", data: { exclusive: false } }),
      event({ eventDate: "2026-02-01", data: { exclusive: true } }),
    ];
    const result = readAsiExclusiveStatus(events);
    expect(result.exclusive).toBe(true);
    expect(result.latest?.eventDate).toBe("2026-02-01");
  });

  it("ignores non-boolean payload safely", () => {
    const events = [event({ data: { exclusive: "yes" } })];
    expect(readAsiExclusiveStatus(events).exclusive).toBeNull();
  });
});

describe("readMpasiStatus", () => {
  it("returns the most recent start date", () => {
    const events = [
      event({ kind: "mpasi_started", eventDate: "2026-06-01" }),
      event({ kind: "mpasi_started", eventDate: "2026-06-15" }),
    ];
    expect(readMpasiStatus(events).startedAt).toBe("2026-06-15");
  });

  it("returns null when no MPASI event found", () => {
    expect(readMpasiStatus([]).startedAt).toBeNull();
  });
});

describe("readDewormingHistory", () => {
  it("groups deworming events sorted desc by date", () => {
    const events = [
      event({ id: "1", kind: "deworming", eventDate: "2026-02-01" }),
      event({ id: "2", kind: "asi_exclusive", eventDate: "2026-02-02" }),
      event({ id: "3", kind: "deworming", eventDate: "2026-05-10" }),
    ];
    const history = readDewormingHistory(events);
    expect(history.events.map((e) => e.id)).toEqual(["3", "1"]);
  });

  it("counts only doses falling within the current calendar year", () => {
    const currentYear = new Date().getFullYear();
    const events = [
      event({
        kind: "deworming",
        id: "1",
        eventDate: `${currentYear}-02-10`,
      }),
      event({
        kind: "deworming",
        id: "2",
        eventDate: `${currentYear}-08-10`,
      }),
      event({
        kind: "deworming",
        id: "3",
        eventDate: `${currentYear - 1}-08-10`,
      }),
    ];
    const history = readDewormingHistory(events);
    expect(history.current.year).toBe(currentYear);
    expect(history.current.dosesThisYear).toBe(2);
  });
});
