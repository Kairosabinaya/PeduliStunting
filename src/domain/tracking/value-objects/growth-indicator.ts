/**
 * The four anthropometric indicators tracked in the MVP.
 *
 * - `BB_U` weight-for-age
 * - `TB_U` length/height-for-age (length when measured lying, height when standing)
 * - `BB_TB` weight-for-length/height (the axis is height in cm, not age)
 * - `LK_U` head-circumference-for-age
 *
 * Mirrors the `growth_standards.indicator` CHECK constraint.
 */
export const GROWTH_INDICATORS = ["BB_U", "TB_U", "BB_TB", "LK_U"] as const;
export type GrowthIndicator = (typeof GROWTH_INDICATORS)[number];

export function isGrowthIndicator(value: string): value is GrowthIndicator {
  return (GROWTH_INDICATORS as readonly string[]).includes(value);
}
