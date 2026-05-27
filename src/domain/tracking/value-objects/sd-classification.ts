import type { GrowthIndicator } from "./growth-indicator";

/**
 * Categorisation labels used in Buku KIA 2024 / Permenkes No. 2 Tahun 2020.
 * Each indicator only uses a subset of labels; the `classify*` helpers below
 * encode the per-indicator policy so the UI does not need to know the cutoffs.
 */
export const SD_CLASSES = [
  "buruk",
  "kurang",
  "normal",
  "lebih",
  "obesitas",
  "pendek",
  "sangat_pendek",
  "tinggi",
  "kurus",
  "sangat_kurus",
  "gemuk",
  "mikrosefali",
  "makrosefali",
] as const;

export type SdClass = (typeof SD_CLASSES)[number];

/**
 * Threshold-based classifier per growth indicator.
 *
 * Reference: Permenkes No. 2 Tahun 2020 (Standar Antropometri Anak), reproduced
 * verbatim in Buku KIA 2024. Keeping the rules in one function lets the test
 * suite assert every boundary in a single table-driven spec.
 */
export function classify(
  indicator: GrowthIndicator,
  z: number,
): SdClass {
  switch (indicator) {
    case "BB_U": {
      if (z < -3) return "buruk";
      if (z < -2) return "kurang";
      if (z <= 1) return "normal";
      return "lebih";
    }
    case "TB_U": {
      if (z < -3) return "sangat_pendek";
      if (z < -2) return "pendek";
      if (z <= 3) return "normal";
      return "tinggi";
    }
    case "BB_TB": {
      if (z < -3) return "sangat_kurus";
      if (z < -2) return "kurus";
      if (z <= 1) return "normal";
      if (z <= 2) return "gemuk";
      if (z <= 3) return "lebih";
      return "obesitas";
    }
    case "LK_U": {
      if (z < -2) return "mikrosefali";
      if (z <= 2) return "normal";
      return "makrosefali";
    }
  }
}
