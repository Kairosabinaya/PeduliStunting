import type { NutritionEventDto } from "@/application/health-plan/dtos";
import type { NutritionEventKind } from "@/domain/health-plan/entities/nutrition-event";

/**
 * Helper murni untuk membaca status terkini dari deret event nutrisi yang
 * berurutan (paling baru di depan). UI mengkonsumsi snapshot ini untuk
 * menampilkan toggle / tanggal / progress tanpa memformat ulang.
 *
 * Skema event-style (Phase 5) menyimpan setiap perubahan sebagai baris baru
 * dengan unique (child_id, kind, event_date). Fungsi di bawah merangkum
 * deret ini menjadi answer-shaped objects.
 */

export function latestEventOfKind(
  events: readonly NutritionEventDto[],
  kind: NutritionEventKind,
): NutritionEventDto | null {
  let best: NutritionEventDto | null = null;
  for (const event of events) {
    if (event.kind !== kind) continue;
    if (best === null || event.eventDate > best.eventDate) {
      best = event;
    }
  }
  return best;
}

export interface AsiExclusiveStatus {
  readonly latest: NutritionEventDto | null;
  readonly exclusive: boolean | null;
}

export function readAsiExclusiveStatus(
  events: readonly NutritionEventDto[],
): AsiExclusiveStatus {
  const latest = latestEventOfKind(events, "asi_exclusive");
  if (!latest) {
    return { latest: null, exclusive: null };
  }
  const value = latest.data["exclusive"];
  const exclusive = typeof value === "boolean" ? value : null;
  return { latest, exclusive };
}

export interface MpasiStatus {
  readonly latest: NutritionEventDto | null;
  readonly startedAt: string | null;
}

export function readMpasiStatus(
  events: readonly NutritionEventDto[],
): MpasiStatus {
  const latest = latestEventOfKind(events, "mpasi_started");
  return {
    latest,
    startedAt: latest?.eventDate ?? null,
  };
}

export interface DewormingYearSummary {
  readonly year: number;
  readonly dosesThisYear: number;
}

export function readDewormingHistory(events: readonly NutritionEventDto[]): {
  readonly events: readonly NutritionEventDto[];
  readonly current: DewormingYearSummary;
} {
  const dewormingEvents = events
    .filter((event) => event.kind === "deworming")
    .slice()
    .sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));
  const year = new Date().getFullYear();
  const dosesThisYear = dewormingEvents.filter((event) =>
    event.eventDate.startsWith(`${year}-`),
  ).length;
  return {
    events: dewormingEvents,
    current: { year, dosesThisYear },
  };
}

export function isAgeInRange(
  ageMonths: number,
  min: number,
  max: number,
): boolean {
  return ageMonths >= min && ageMonths <= max;
}
