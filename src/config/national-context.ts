/**
 * Fixed national reference values for the stunting dashboard. These are
 * published policy targets and survey headline figures (not model output), so
 * they live in config per project guidelines §2.2 rather than in a model table.
 *
 * The population-weighted `nationalPrevalence` (SSGI/SKI) is deliberately
 * distinct from the dashboard's cross-region mean of `region_indicators`: the
 * national figure weights by child population, the cross-region mean treats
 * every kabupaten/kota equally. The UI surfaces both and explains the gap.
 */
export const NATIONAL_CONTEXT = {
  source: "SSGI/SKI Kemenkes",
  /** RPJMN 2025-2029 national stunting prevalence target (percent). */
  rpjmnTarget2029: 14.2,
  /** WHO public-health significance thresholds (percent). */
  whoThresholdHigh: 20,
  whoThresholdVeryHigh: 30,
  /** Population-weighted national prevalence per year (percent), SSGI/SKI. */
  nationalPrevalence: [
    { tahun: 2021, prevalence: 24.4 },
    { tahun: 2022, prevalence: 21.6 },
    { tahun: 2023, prevalence: 21.5 },
    { tahun: 2024, prevalence: 19.8 },
  ],
} as const;

export type NationalPrevalencePoint =
  (typeof NATIONAL_CONTEXT.nationalPrevalence)[number];
