/**
 * Range of observation years available in the dataset.
 *
 * UI components must derive bounds from this module instead of hardcoding
 * 2021..2024 literals. When new years are imported into `region_indicators`,
 * extend this list rather than touching component code.
 */
export const SUPPORTED_YEARS = [2021, 2022, 2023, 2024] as const;

export type SupportedYear = (typeof SUPPORTED_YEARS)[number];

export const MIN_YEAR: SupportedYear = SUPPORTED_YEARS[0];
export const MAX_YEAR: SupportedYear =
  SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1] ?? SUPPORTED_YEARS[0];

export function isSupportedYear(value: number): value is SupportedYear {
  return (SUPPORTED_YEARS as readonly number[]).includes(value);
}
