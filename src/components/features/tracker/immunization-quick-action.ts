import type { ChildImmunizationStatus } from "@/domain/health-plan/entities/child-immunization";

export interface ApplyImmunizationStatusOptions {
  readonly childBirthDate: string;
  readonly nextStatus: ChildImmunizationStatus;
  readonly today: string;
}

/**
 * Prepare the {@link FormData} for a quick immunization status change while
 * preserving what the user already typed in the sheet. Only the fields the
 * quick action owns are overridden:
 *
 *   - `status` is set to the chosen status.
 *   - `givenAt` keeps the typed date when marking `done` (defaulting to today
 *     only when empty); it is cleared for `pending`/`skipped`.
 *   - `note` is left exactly as typed — never clobbered with stale state.
 *
 * @example
 * ```ts
 * const form = new FormData(formRef.current);
 * applyImmunizationStatus(form, { childBirthDate, nextStatus: "done", today });
 * ```
 */
export function applyImmunizationStatus(
  form: FormData,
  options: ApplyImmunizationStatusOptions,
): FormData {
  form.set("childBirthDate", options.childBirthDate);
  form.set("status", options.nextStatus);
  if (options.nextStatus === "done") {
    const typed = String(form.get("givenAt") ?? "").trim();
    form.set("givenAt", typed.length > 0 ? typed : options.today);
  } else {
    form.set("givenAt", "");
  }
  return form;
}
