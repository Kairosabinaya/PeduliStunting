import type { PregnancyEventDto } from "@/application/pregnancy/dtos";
import type { PregnancyEventKind } from "@/domain/pregnancy/entities/pregnancy-event";
import {
  ANC_TARGET_SLOTS,
  FETAL_MILESTONES,
  PREGNANCY_TOTAL_WEEKS,
  PREGNANCY_TRIMESTER_BOUNDARIES,
  WEIGHT_GAIN_GUIDES,
  type FetalMilestone,
  type WeightGainGuide,
} from "@/config/pregnancy";

/**
 * Helpers murni untuk derive presentation-ready snapshots dari profil
 * kehamilan + deret event. Tidak ada IO, tidak ada side-effects.
 */

const DAYS_PER_WEEK = 7;

export interface GestationalAge {
  readonly weeks: number;
  readonly days: number;
  readonly totalDays: number;
}

export interface PregnancyOverview {
  readonly hpht: string;
  readonly expectedDue: string | null;
  readonly gestational: GestationalAge;
  readonly trimester: 1 | 2 | 3;
  readonly daysToDueDate: number | null;
  readonly progressFraction: number;
}

export function computeGestationalAge(
  hpht: string,
  referenceDate: string,
): GestationalAge {
  const start = new Date(`${hpht}T00:00:00`).getTime();
  const today = new Date(`${referenceDate}T00:00:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(today)) {
    return { weeks: 0, days: 0, totalDays: 0 };
  }
  const diffMs = today - start;
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(totalDays / DAYS_PER_WEEK);
  const days = totalDays - weeks * DAYS_PER_WEEK;
  return { weeks, days, totalDays };
}

export function resolveTrimester(weeks: number): 1 | 2 | 3 {
  if (weeks <= PREGNANCY_TRIMESTER_BOUNDARIES.t1End) return 1;
  if (weeks <= PREGNANCY_TRIMESTER_BOUNDARIES.t2End) return 2;
  return 3;
}

export function buildOverview(
  hpht: string,
  expectedDue: string | null,
  referenceDate: string,
): PregnancyOverview {
  const gestational = computeGestationalAge(hpht, referenceDate);
  const trimester = resolveTrimester(gestational.weeks);
  let daysToDueDate: number | null = null;
  if (expectedDue) {
    const due = new Date(`${expectedDue}T00:00:00`).getTime();
    const today = new Date(`${referenceDate}T00:00:00`).getTime();
    if (Number.isFinite(due) && Number.isFinite(today)) {
      daysToDueDate = Math.round((due - today) / (1000 * 60 * 60 * 24));
    }
  }
  const progressFraction = Math.max(
    0,
    Math.min(1, gestational.weeks / PREGNANCY_TOTAL_WEEKS),
  );
  return {
    hpht,
    expectedDue,
    gestational,
    trimester,
    daysToDueDate,
    progressFraction,
  };
}

/* ─────────────────────────── ANC ─────────────────────────── */

export interface AncSlotStatus {
  readonly visitNumber: number;
  readonly recorded: boolean;
  readonly eventDate: string | null;
  readonly byDoctor: boolean | null;
  readonly hasUsg: boolean | null;
}

export interface AncSummary {
  readonly slots: readonly AncSlotStatus[];
  readonly completed: number;
  readonly target: number;
}

export function buildAncSummary(
  events: readonly PregnancyEventDto[],
): AncSummary {
  const ancEvents = events.filter((event) => event.kind === "anc_visit");
  const slots = ANC_TARGET_SLOTS.map<AncSlotStatus>((slot) => {
    const match = ancEvents.find(
      (event) =>
        typeof event.data["visit_number"] === "number" &&
        event.data["visit_number"] === slot.visitNumber,
    );
    if (!match) {
      return {
        visitNumber: slot.visitNumber,
        recorded: false,
        eventDate: null,
        byDoctor: null,
        hasUsg: null,
      };
    }
    return {
      visitNumber: slot.visitNumber,
      recorded: true,
      eventDate: match.eventDate,
      byDoctor:
        typeof match.data["by_doctor"] === "boolean"
          ? match.data["by_doctor"]
          : null,
      hasUsg:
        typeof match.data["has_usg"] === "boolean"
          ? match.data["has_usg"]
          : null,
    };
  });
  const completed = slots.filter((slot) => slot.recorded).length;
  return { slots, completed, target: ANC_TARGET_SLOTS.length };
}

/* ─────────────────────────── TTD ─────────────────────────── */

export interface TtdSummary {
  readonly dosesThisMonth: number;
  readonly lastDose: PregnancyEventDto | null;
  readonly history: readonly PregnancyEventDto[];
}

export function buildTtdSummary(
  events: readonly PregnancyEventDto[],
  referenceDate: string,
): TtdSummary {
  const ttdEvents = events
    .filter((event) => event.kind === "ttd_dose")
    .slice()
    .sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));
  const yearMonth = referenceDate.slice(0, 7);
  const dosesThisMonth = ttdEvents.filter((event) =>
    event.eventDate.startsWith(yearMonth),
  ).length;
  return {
    dosesThisMonth,
    lastDose: ttdEvents[0] ?? null,
    history: ttdEvents,
  };
}

/* ─────────────────────────── Berat ─────────────────────────── */

export interface WeightEntry {
  readonly eventDate: string;
  readonly weightKg: number;
  readonly note: string | null;
}

export interface WeightSummary {
  readonly entries: readonly WeightEntry[];
  readonly latest: WeightEntry | null;
  readonly initialWeightKg: number | null;
  readonly currentGainKg: number | null;
  readonly recommendation: WeightGainGuide | null;
}

export function buildWeightSummary(
  events: readonly PregnancyEventDto[],
  initialWeightKg: number | null,
  heightCm: number | null,
): WeightSummary {
  const entries: WeightEntry[] = [];
  for (const event of events) {
    if (event.kind !== "weight_measurement") continue;
    const value = event.data["weight_kg"];
    if (typeof value !== "number" || value <= 0) continue;
    entries.push({
      eventDate: event.eventDate,
      weightKg: value,
      note: event.note,
    });
  }
  entries.sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));

  const latest = entries[0] ?? null;
  const currentGainKg =
    latest && initialWeightKg !== null
      ? latest.weightKg - initialWeightKg
      : null;

  const recommendation = pickWeightGainGuide(initialWeightKg, heightCm);

  return {
    entries,
    latest,
    initialWeightKg,
    currentGainKg,
    recommendation,
  };
}

function pickWeightGainGuide(
  weightKg: number | null,
  heightCm: number | null,
): WeightGainGuide | null {
  if (
    weightKg === null ||
    heightCm === null ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }
  const meters = heightCm / 100;
  const bmi = weightKg / (meters * meters);
  for (const guide of WEIGHT_GAIN_GUIDES) {
    if (bmi >= guide.minBmi && bmi <= guide.maxBmi) return guide;
  }
  return null;
}

/* ─────────────────────────── milestone janin ─────────────────────────── */

export function pickFetalMilestone(weeks: number): FetalMilestone | null {
  for (const milestone of FETAL_MILESTONES) {
    if (weeks >= milestone.fromWeek && weeks <= milestone.toWeek) {
      return milestone;
    }
  }
  return null;
}

export const PREGNANCY_EVENT_KIND_LABEL: Record<PregnancyEventKind, string> = {
  anc_visit: "Kunjungan ANC",
  ttd_dose: "Dosis TTD",
  weight_measurement: "Pengukuran berat",
};
