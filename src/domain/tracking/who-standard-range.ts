/**
 * The WHO Child Growth Standards (and the seeded `growth_standards` table)
 * cover ages 0-60 completed months. Beyond this window no LMS row exists, so a
 * z-score cannot be computed for the age-based indicators. Callers use this to
 * surface an explicit "out of range" outcome instead of silently persisting a
 * measurement with no screening result.
 */
export const WHO_STANDARD_MAX_AGE_MONTHS = 60;

/** Returns true when `ageMonths` falls inside the WHO standard window. */
export function isAgeWithinWhoStandards(ageMonths: number): boolean {
  return ageMonths >= 0 && ageMonths <= WHO_STANDARD_MAX_AGE_MONTHS;
}
