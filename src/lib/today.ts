/**
 * Today's date as a `YYYY-MM-DD` string in the local timezone.
 *
 * Centralised because several tracker surfaces need "today" as the default
 * value for date inputs and as the upper bound when computing a child's age in
 * completed months. Local time (not UTC) is intentional: the parent enters
 * dates in their own calendar day.
 *
 * @example
 * ```ts
 * <input type="date" max={todayIso()} defaultValue={todayIso()} />
 * ```
 */
export function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
