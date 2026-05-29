import type { GrowthMeasurement } from "../entities/growth-measurement";
import type { GrowthIndicator } from "../value-objects/growth-indicator";

/**
 * Tren z-score lintas pengukuran berurutan. Ditampilkan sebagai chip di atas
 * kurva pertumbuhan agar orang tua mendapat insight singkat tanpa harus
 * membaca grafik.
 *
 * Klasifikasi sengaja konservatif dan didorong oleh besarnya delta z, bukan
 * absolut z, agar interpretasi konsisten lintas indikator dan rentang usia:
 *
 *   - `improving`     : delta z positif >= 0.25 SD
 *   - `stable`        : delta z dalam rentang [-0.25, +0.25] SD
 *   - `monitor`       : delta z negatif <= -0.25 SD
 *   - `not_enough`    : kurang dari dua titik pengukuran dengan z-score
 *
 * Ambang 0.25 SD dipilih agar fluktuasi pengukuran rutin (yang umum berkisar
 * ±0.1-0.2 SD karena ketidakpresisian alat) tidak memicu alarm; perubahan
 * di atas 0.25 SD biasanya bukan derau dan layak diperhatikan orang tua.
 */
export type GrowthTrend = "improving" | "stable" | "monitor" | "not_enough";

const DELTA_THRESHOLD_SD = 0.25;

export interface GrowthTrendResult {
  readonly trend: GrowthTrend;
  /** Delta z-score saat ini dikurang z-score sebelumnya, atau null jika tidak cukup data. */
  readonly deltaZ: number | null;
  readonly latestZ: number | null;
  readonly previousZ: number | null;
}

interface DataPointLike {
  readonly measuredAt: string;
  readonly zScores: Readonly<Record<string, number>>;
}

/**
 * Klasifikasi tren berdasarkan dua pengukuran terbaru yang memiliki z-score
 * untuk indikator yang diminta. Pengukuran tanpa z-score untuk indikator itu
 * dilewati saat mencari dua titik terbaru.
 *
 * Konvensi:
 *   - "improving" untuk z naik (mis. -2.1 → -1.5 berarti membaik untuk TB/U).
 *   - "monitor" untuk z turun (mis. -1.0 → -2.2 berarti memburuk untuk TB/U).
 *
 * Untuk BB/TB konvensi yang sama tetap dipertahankan walau interpretasi
 * spesifik (membaik/memburuk) bergantung konteks; lapisan UI memilih copy.
 */
export function computeGrowthTrend(
  measurements: readonly DataPointLike[],
  indicator: GrowthIndicator,
): GrowthTrendResult {
  const candidates = measurements
    .filter((m) => {
      const value = m.zScores[indicator];
      return typeof value === "number" && Number.isFinite(value);
    })
    .slice()
    .sort((a, b) => (a.measuredAt < b.measuredAt ? 1 : -1));

  const latest = candidates[0];
  if (latest === undefined) {
    return {
      trend: "not_enough",
      deltaZ: null,
      latestZ: null,
      previousZ: null,
    };
  }
  const latestZ = latest.zScores[indicator];
  if (latestZ === undefined) {
    return {
      trend: "not_enough",
      deltaZ: null,
      latestZ: null,
      previousZ: null,
    };
  }

  const previous = candidates[1];
  if (previous === undefined) {
    return {
      trend: "not_enough",
      deltaZ: null,
      latestZ,
      previousZ: null,
    };
  }
  const previousZ = previous.zScores[indicator];
  if (previousZ === undefined) {
    return {
      trend: "not_enough",
      deltaZ: null,
      latestZ,
      previousZ: null,
    };
  }
  const deltaZ = latestZ - previousZ;

  if (deltaZ >= DELTA_THRESHOLD_SD) {
    return { trend: "improving", deltaZ, latestZ, previousZ };
  }
  if (deltaZ <= -DELTA_THRESHOLD_SD) {
    return { trend: "monitor", deltaZ, latestZ, previousZ };
  }
  return { trend: "stable", deltaZ, latestZ, previousZ };
}

/**
 * Versi yang menerima entitas domain `GrowthMeasurement` langsung — dipakai
 * use case sisi server saat sudah punya entitas. UI sisi client memakai
 * `computeGrowthTrend` dengan DTO karena z-scores adalah `Record<string, number>`.
 */
export function computeGrowthTrendFromEntities(
  measurements: readonly GrowthMeasurement[],
  indicator: GrowthIndicator,
): GrowthTrendResult {
  const points = measurements.map((m) => ({
    measuredAt: m.measuredAt,
    zScores: m.zScores as Readonly<Record<string, number>>,
  }));
  return computeGrowthTrend(points, indicator);
}
