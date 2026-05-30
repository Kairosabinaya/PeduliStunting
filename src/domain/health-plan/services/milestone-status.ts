import type { ChildMilestoneStatus } from "../entities/child-milestone";
import type { MilestoneDomain } from "../entities/milestone";

export interface MilestoneInput {
  readonly id: string;
  readonly domain: MilestoneDomain;
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
}

export interface MilestoneRecordInput {
  readonly milestoneId: string;
  readonly status: ChildMilestoneStatus;
}

/**
 * Apakah milestone berada dalam rentang usia anak saat ini.
 *
 * Konvensi Buku KIA: milestone valid jika `minAge <= age <= maxAge` (inclusive
 * di kedua sisi). Untuk anak yang berada tepat di batas atas, milestone masih
 * dianggap relevan (orang tua kemungkinan masih dalam siklus pemeriksaan).
 */
export function isMilestoneInRange(
  milestone: MilestoneInput,
  childAgeMonths: number,
): boolean {
  return (
    milestone.minAgeMonths <= childAgeMonths &&
    milestone.maxAgeMonths >= childAgeMonths
  );
}

export interface MilestoneAlertResult {
  readonly delayedCount: number;
  readonly notCheckedCount: number;
  readonly totalInRange: number;
  readonly shouldAlert: boolean;
}

/**
 * Hitung jumlah milestone dalam rentang usia anak yang ditandai terlambat
 * (`delayed`). Sesuai Buku KIA, satu jawaban "Tidak" di rentang usia
 * sekarang sudah cukup menjadi indikasi rujukan ke Puskesmas/Posyandu.
 *
 * `shouldAlert` mengikuti aturan tersebut: true jika `delayedCount > 0`.
 */
export function computeMilestoneAlert(
  catalog: readonly MilestoneInput[],
  records: readonly MilestoneRecordInput[],
  childAgeMonths: number,
): MilestoneAlertResult {
  const inRange = catalog.filter((m) => isMilestoneInRange(m, childAgeMonths));
  const recordById = new Map(records.map((r) => [r.milestoneId, r]));

  let delayedCount = 0;
  let notCheckedCount = 0;
  for (const milestone of inRange) {
    const record = recordById.get(milestone.id);
    if (!record || record.status === "not_checked") {
      notCheckedCount += 1;
      continue;
    }
    if (record.status === "delayed") {
      delayedCount += 1;
    }
  }
  return {
    delayedCount,
    notCheckedCount,
    totalInRange: inRange.length,
    shouldAlert: delayedCount > 0,
  };
}

/**
 * Filter milestone berdasarkan mode tampilan:
 *   - `current`: hanya milestone yang sesuai dengan rentang usia anak.
 *   - `all`: semua entri katalog tanpa filter.
 */
export function filterMilestonesByMode<T extends MilestoneInput>(
  catalog: readonly T[],
  childAgeMonths: number,
  mode: "current" | "all",
): readonly T[] {
  if (mode === "all") return catalog;
  return catalog.filter((m) => isMilestoneInRange(m, childAgeMonths));
}
