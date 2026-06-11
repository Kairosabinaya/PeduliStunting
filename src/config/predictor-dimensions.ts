/**
 * Presentation-only mapping between the canonical English snake_case dimension
 * codes used in the `indicator_dictionary.dimension` CHECK enum and the
 * Indonesian labels that the UI surfaces to readers.
 *
 * The dimension *codes* live in the domain (see
 * `@/domain/region/entities/indicator-definition`). This file only resolves
 * the human-readable label and short tagline shown on dashboards, the map
 * side panel, and any future analytics page. Adding a new dimension requires
 * updating the domain enum and adding the matching entry here.
 */

import {
  INDICATOR_DIMENSIONS,
  type IndicatorDimension,
} from "@/domain/region/entities/indicator-definition";

export interface PredictorDimensionLabel {
  readonly code: IndicatorDimension;
  /** Label shown as the section header. */
  readonly label: string;
  /** One-line caption shown beneath the label. */
  readonly description: string;
}

const FALLBACK_LABEL: PredictorDimensionLabel = {
  code: "other",
  label: "Lainnya",
  description: "Dimensi belum dipetakan ke label UI.",
} as const;

const LABELS_BY_CODE: Readonly<
  Record<IndicatorDimension, PredictorDimensionLabel>
> = {
  outcome: {
    code: "outcome",
    label: "Outcome",
    description: "Variabel target — prevalensi atau kategori stunting.",
  },
  socioeconomic: {
    code: "socioeconomic",
    label: "Sosial-ekonomi",
    description:
      "Indikator pendapatan, pengeluaran, kemiskinan, dan ketahanan pangan rumah tangga.",
  },
  health_service: {
    code: "health_service",
    label: "Layanan kesehatan",
    description:
      "Akses dan cakupan layanan KIA: imunisasi, kunjungan posyandu, penolong persalinan.",
  },
  environment: {
    code: "environment",
    label: "Lingkungan",
    description:
      "Sanitasi, air bersih, dan kondisi rumah yang memengaruhi paparan penyakit menular.",
  },
  demography: {
    code: "demography",
    label: "Demografi",
    description:
      "Komposisi penduduk, struktur usia, dan karakteristik rumah tangga.",
  },
  nutrition: {
    code: "nutrition",
    label: "Gizi",
    description:
      "Pola makan, konsumsi protein, ASI eksklusif, dan praktik pemberian makan bayi.",
  },
  other: {
    code: "other",
    label: "Lainnya",
    description: "Indikator pendukung di luar lima dimensi utama.",
  },
};

/**
 * Stable ordering used by the dashboard predictor dictionary. Outcomes appear
 * first so the response variable is anchored at the top of the section.
 */
export const PREDICTOR_DIMENSION_ORDER: readonly IndicatorDimension[] = [
  "outcome",
  "socioeconomic",
  "nutrition",
  "health_service",
  "environment",
  "demography",
  "other",
];

export function getPredictorDimensionLabel(
  code: string | null | undefined,
): PredictorDimensionLabel {
  if (!code) return FALLBACK_LABEL;
  return (
    LABELS_BY_CODE[code as IndicatorDimension] ?? {
      ...FALLBACK_LABEL,
      code: code as IndicatorDimension,
    }
  );
}

export function listPredictorDimensionLabels(): readonly PredictorDimensionLabel[] {
  return PREDICTOR_DIMENSION_ORDER.map((code) => LABELS_BY_CODE[code]);
}

export { INDICATOR_DIMENSIONS };
