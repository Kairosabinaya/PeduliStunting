export type VitAEligibility = "ok" | "out_of_age" | "out_of_month";

export interface VitAEligibilityInput {
  readonly childAgeMonths: number;
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
  /** Calendar month the dose is tied to (1=Jan..12=Dec), or `null` if anytime. */
  readonly calendarMonth: number | null;
  /** Current calendar month (1-12), derived from the app's canonical today. */
  readonly currentMonth: number;
}

/**
 * Whether a Vitamin A capsule can be recorded right now. The red capsules are
 * national campaign doses given only in a fixed calendar month (February and
 * August), so age eligibility alone is not enough — recording must also fall in
 * the right month. The blue capsule (`calendarMonth: null`) is available any
 * month within its age window.
 *
 * @example
 * ```ts
 * vitAKapsulEligibility({ childAgeMonths: 24, minAgeMonths: 12, maxAgeMonths: 59, calendarMonth: 2, currentMonth: 4 });
 * // -> "out_of_month"
 * ```
 */
export function vitAKapsulEligibility(
  input: VitAEligibilityInput,
): VitAEligibility {
  const inAgeRange =
    input.childAgeMonths >= input.minAgeMonths &&
    input.childAgeMonths <= input.maxAgeMonths;
  if (!inAgeRange) return "out_of_age";
  if (
    input.calendarMonth !== null &&
    input.currentMonth !== input.calendarMonth
  ) {
    return "out_of_month";
  }
  return "ok";
}
