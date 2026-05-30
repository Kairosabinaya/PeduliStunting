import type { ChildImmunizationStatus } from "../entities/child-immunization";

/**
 * Status visual per cell pada timeline imunisasi. Berasal dari kombinasi
 * usia anak (bulan) + record progress + jadwal rekomendasi.
 *
 *   - `done`     : sudah diberikan (record.status === "done").
 *   - `upcoming` : akan datang dalam ~30 hari (atau baru saja telewati ringan).
 *   - `missed`   : sudah lewat lebih dari satu bulan tanpa pemberian.
 *   - `future`   : masih lebih dari satu bulan ke depan.
 *   - `skipped`  : sengaja dilewati (mis. kontraindikasi medis).
 *
 * Ambang ±1 bulan dipilih agar margin posyandu rutin (yang bisa bergeser
 * beberapa hari) tidak langsung memerahkan kartu — orang tua harus melihat
 * status menenangkan saat datangnya posyandu sedikit terlambat.
 */
export type ImmunizationCellStatus =
  | "done"
  | "upcoming"
  | "missed"
  | "future"
  | "skipped";

const UPCOMING_WINDOW_MONTHS = 1;

export interface ImmunizationCellInput {
  readonly recommendedAgeMonths: number | null;
  readonly childAgeMonths: number;
  readonly recordStatus: ChildImmunizationStatus | null;
}

export function computeImmunizationCellStatus(
  input: ImmunizationCellInput,
): ImmunizationCellStatus {
  if (input.recordStatus === "done") return "done";
  if (input.recordStatus === "skipped") return "skipped";

  const recommended = input.recommendedAgeMonths;
  if (recommended === null) return "future";

  const monthsUntilDue = recommended - input.childAgeMonths;

  if (monthsUntilDue > UPCOMING_WINDOW_MONTHS) {
    return "future";
  }
  if (monthsUntilDue >= -UPCOMING_WINDOW_MONTHS) {
    return "upcoming";
  }
  return "missed";
}

export interface ImmunizationProgressInput {
  readonly recommendedAgeMonths: number | null;
  readonly recordStatus: ChildImmunizationStatus | null;
}

export interface ImmunizationProgressTotals {
  readonly due: number;
  readonly done: number;
}

/**
 * Hitung "X dari Y" yang ditampilkan progress ring di atas timeline.
 *
 * `due` = vaksin yang sudah waktunya (recommended_age <= childAgeMonths) ATAU
 *         sudah ditandai done/skipped (record menandakan keputusan eksplisit).
 * `done` = subset `due` dengan record.status === "done".
 *
 * Vaksin tanpa `recommendedAgeMonths` (mis. JE endemic) dianggap "future"
 * dan tidak masuk denominator sampai user menandainya done/skipped manual.
 */
export function computeImmunizationProgress(
  items: readonly ImmunizationProgressInput[],
  childAgeMonths: number,
): ImmunizationProgressTotals {
  let due = 0;
  let done = 0;
  for (const item of items) {
    const isDueByAge =
      item.recommendedAgeMonths !== null &&
      item.recommendedAgeMonths <= childAgeMonths;
    const hasRecord =
      item.recordStatus === "done" || item.recordStatus === "skipped";
    if (isDueByAge || hasRecord) {
      due += 1;
      if (item.recordStatus === "done") {
        done += 1;
      }
    }
  }
  return { due, done };
}
