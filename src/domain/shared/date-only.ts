import type { Brand } from "./brand";

/**
 * `DateOnly` is a calendar date (`YYYY-MM-DD`) without time-of-day, branded
 * so it cannot be confused with arbitrary strings or `Date` objects.
 *
 * All comparisons use lexical string ordering, which is correct because the
 * ISO 8601 format orders chronologically as strings.
 */
export type DateOnly = Brand<string, "DateOnly">;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value: string): value is DateOnly {
  if (!ISO_DATE_RE.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.toISOString().slice(0, 10) === value;
}

export function asDateOnly(value: string): DateOnly {
  if (!isDateOnly(value)) {
    throw new Error(`Invalid DateOnly: ${value}`);
  }
  return value as DateOnly;
}

export function dateOnlyFromDate(date: Date): DateOnly {
  const yyyy = date.getUTCFullYear().toString().padStart(4, "0");
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = date.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}` as DateOnly;
}

export function dateOnlyToUtcDate(value: DateOnly): Date {
  return new Date(`${value}T00:00:00Z`);
}
