import type { Brand } from "@/domain/shared/brand";

/**
 * Observation year for {@link RegionIndicators}, {@link ModelPrediction}, and
 * coefficients. Range is enforced by the database CHECK (2000..2100); the VO
 * keeps it as a branded integer so callers cannot confuse a year with a count
 * of years or any other number.
 */
export type Year = Brand<number, "Year">;

export function asYear(value: number): Year {
  if (!Number.isInteger(value) || value < 2000 || value > 2100) {
    throw new Error(`Invalid Year: ${value}`);
  }
  return value as Year;
}
