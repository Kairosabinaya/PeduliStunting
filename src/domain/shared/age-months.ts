import type { Brand } from "./brand";
import {
  dateOnlyToUtcDate,
  type DateOnly,
} from "./date-only";

/**
 * Age expressed as full elapsed calendar months.
 *
 * WHO LMS standards are indexed by `age_months`. We compute it deterministically
 * from `birthDate` and a reference `measuredAt` so the calculation is testable
 * with a fixed clock and stable across time zones.
 */
export type AgeMonths = Brand<number, "AgeMonths">;

export function asAgeMonths(value: number): AgeMonths {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`AgeMonths must be a non-negative integer, got ${value}`);
  }
  return value as AgeMonths;
}

/**
 * Difference in completed months between two calendar dates.
 *
 * Counts a month only after the day-of-month is reached, matching the way
 * paediatricians read growth charts ("the child is 7 months old once the
 * birth-day-of-month passes in the 7th month after birth").
 *
 * @example
 * ```ts
 * monthsBetween(asDateOnly("2024-01-15"), asDateOnly("2024-08-14"));
 * // returns 6 — the 15th of August has not been reached yet.
 * ```
 */
export function monthsBetween(birth: DateOnly, reference: DateOnly): AgeMonths {
  const b = dateOnlyToUtcDate(birth);
  const r = dateOnlyToUtcDate(reference);
  if (r.getTime() < b.getTime()) {
    throw new Error("Reference date must not precede the birth date.");
  }
  let months =
    (r.getUTCFullYear() - b.getUTCFullYear()) * 12 +
    (r.getUTCMonth() - b.getUTCMonth());
  if (r.getUTCDate() < b.getUTCDate()) {
    months -= 1;
  }
  return asAgeMonths(Math.max(0, months));
}
