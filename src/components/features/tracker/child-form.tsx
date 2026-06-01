"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState, useId, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, buttonVariants } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import {
  SegmentedControl,
  segmentedPanelProps,
} from "@/components/primitives/segmented-control";
import { Textarea } from "@/components/primitives/textarea";
import {
  ADD_CHILD_COPY,
  TRACKER_FIELD_LIMITS,
  TRACKER_VALIDATION_COPY,
} from "@/config/tracker";
import { todayIso } from "@/lib/today";
import { childFormInputSchema } from "@/schemas/tracking";

import {
  INITIAL_ADD_CHILD_STATE,
  type AddChildFormState,
} from "@/app/(app)/tracker/_lib/add-child-state";

/** Whether the child was carried to term or born preterm (< 37 weeks). */
type BirthStatus = "term" | "preterm";

/** Prefilled string values for the form fields (empty strings for create). */
export interface ChildFormDefaults {
  readonly name: string;
  readonly sex: "" | "L" | "P";
  readonly birthDate: string;
  readonly birthWeightKg: string;
  readonly birthLengthCm: string;
  readonly isPremature: boolean;
  readonly gestationalAgeWeeks: string;
  readonly notes: string;
}

const EMPTY_DEFAULTS: ChildFormDefaults = {
  name: "",
  sex: "",
  birthDate: "",
  birthWeightKg: "",
  birthLengthCm: "",
  isPremature: false,
  gestationalAgeWeeks: "",
  notes: "",
};

export interface ChildFormProps {
  /** Create or update Server Action; both share {@link AddChildFormState}. */
  readonly action: (
    previous: AddChildFormState | null,
    formData: FormData,
  ) => Promise<AddChildFormState>;
  readonly submitLabel: string;
  readonly cancelHref: string;
  /** Present in edit mode only — rendered as a hidden `childId` field. */
  readonly childId?: string;
  /** Prefilled values; omitted for the create flow. */
  readonly defaults?: ChildFormDefaults;
}

type ChildFormFields = z.input<typeof childFormInputSchema>;
type ChildFormOutput = z.output<typeof childFormInputSchema>;

function SubmitButton({
  label,
  pending,
}: {
  readonly label: string;
  readonly pending: boolean;
}) {
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      {label}
    </Button>
  );
}

function fieldError(
  state: AddChildFormState | null,
  field: string,
  clientMessage?: string | undefined,
): string | undefined {
  return clientMessage ?? state?.fieldErrors?.[field]?.[0];
}

/**
 * Shared form for creating and editing a child profile. Identity fields (name,
 * sex, birth date) are required; birth circumstances (weight/length) are
 * optional. A "Cukup bulan / Prematur" toggle hides the gestational-age field
 * unless the child was born preterm.
 *
 * Uses `useActionState` so React owns the pending state and server-side
 * validation renders without extra round trips. On success the Server Action
 * redirects; on failure field-level errors surface inline. The `action`,
 * `submitLabel`, and `defaults` props let the same form back both the
 * `createChild` and `updateChild` flows (no duplicated markup).
 *
 * @example Create
 * ```tsx
 * <ChildForm action={createChild} submitLabel="Simpan" cancelHref="/tracker" />
 * ```
 * @example Edit
 * ```tsx
 * <ChildForm action={updateChild} submitLabel="Simpan perubahan"
 *   cancelHref={trackerChildRoute(child.id)} childId={child.id}
 *   defaults={toDefaults(child)} />
 * ```
 */
export function ChildForm({
  action,
  submitLabel,
  cancelHref,
  childId,
  defaults = EMPTY_DEFAULTS,
}: ChildFormProps) {
  const [state, formAction] = useActionState<
    AddChildFormState | null,
    FormData
  >(action, INITIAL_ADD_CHILD_STATE);
  const [pending, startTransition] = useTransition();

  const [birthStatus, setBirthStatus] = useState<BirthStatus>(
    defaults.isPremature ? "preterm" : "term",
  );
  const defaultValues = useMemo<ChildFormFields>(
    () => ({
      name: defaults.name,
      sex: defaults.sex,
      birthDate: defaults.birthDate,
      birthWeightKg: defaults.birthWeightKg,
      birthLengthCm: defaults.birthLengthCm,
      birthStatus: defaults.isPremature ? "preterm" : "term",
      gestationalAgeWeeks: defaults.gestationalAgeWeeks,
      notes: defaults.notes,
    }),
    [defaults],
  );
  const form = useForm<ChildFormFields, undefined, ChildFormOutput>({
    resolver: zodResolver(childFormInputSchema),
    defaultValues,
    shouldFocusError: true,
  });

  const nameId = useId();
  const sexId = useId();
  const birthDateId = useId();
  const birthWeightId = useId();
  const birthLengthId = useId();
  const gestationalAgeId = useId();
  const notesId = useId();
  const birthStatusBase = useId();

  const isPreterm = birthStatus === "preterm";

  const generalError =
    state && !state.ok && !state.fieldErrors
      ? (state.message ?? ADD_CHILD_COPY.genericError)
      : null;
  const hasClientErrors = Object.keys(form.formState.errors).length > 0;

  function handleBirthStatusChange(next: BirthStatus) {
    setBirthStatus(next);
    form.setValue("birthStatus", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit((_values, event) => {
        const node = event?.target;
        if (!(node instanceof HTMLFormElement)) return;
        startTransition(() => {
          formAction(new FormData(node));
        });
      })}
      className="space-y-8"
      noValidate
    >
      {childId ? <input type="hidden" name="childId" value={childId} /> : null}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold text-foreground">
          {ADD_CHILD_COPY.identitySectionTitle}
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={nameId} required>
              {ADD_CHILD_COPY.fields.nameLabel}
            </Label>
            <Input
              id={nameId}
              type="text"
              autoComplete="off"
              maxLength={TRACKER_FIELD_LIMITS.childNameMaxLength}
              required
              placeholder={ADD_CHILD_COPY.fields.namePlaceholder}
              errorMessage={fieldError(
                state,
                "name",
                form.formState.errors.name?.message,
              )}
              {...form.register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={sexId} required>
              {ADD_CHILD_COPY.fields.sexLabel}
            </Label>
            <Select
              id={sexId}
              required
              errorMessage={fieldError(
                state,
                "sex",
                form.formState.errors.sex?.message,
              )}
              {...form.register("sex")}
            >
              <option value="" disabled>
                —
              </option>
              <option value="L">{ADD_CHILD_COPY.fields.sexOptionMale}</option>
              <option value="P">{ADD_CHILD_COPY.fields.sexOptionFemale}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={birthDateId} required>
              {ADD_CHILD_COPY.fields.birthDateLabel}
            </Label>
            <Input
              id={birthDateId}
              type="date"
              max={todayIso()}
              required
              errorMessage={fieldError(
                state,
                "birthDate",
                form.formState.errors.birthDate?.message,
              )}
              {...form.register("birthDate")}
            />
          </div>
        </div>
      </fieldset>

      {childId ? (
        <details className="group rounded-lg border border-border p-4 transition-all open:bg-surface-muted/50">
          <summary className="cursor-pointer text-sm font-semibold text-foreground hover:text-primary">
            Edit {ADD_CHILD_COPY.birthSectionTitle} (Opsional)
          </summary>
          <div className="mt-4 space-y-5">
            <p className="text-xs text-muted-foreground">
              {ADD_CHILD_COPY.birthSectionHint}
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={birthWeightId}>
                  {ADD_CHILD_COPY.fields.birthWeightLabel}
                </Label>
                <Input
                  id={birthWeightId}
                  type="number"
                  inputMode="decimal"
                  step={TRACKER_FIELD_LIMITS.birthWeightKg.step}
                  min={TRACKER_FIELD_LIMITS.birthWeightKg.min}
                  max={TRACKER_FIELD_LIMITS.birthWeightKg.max}
                  errorMessage={fieldError(
                    state,
                    "birthWeightKg",
                    form.formState.errors.birthWeightKg?.message,
                  )}
                  {...form.register("birthWeightKg")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={birthLengthId}>
                  {ADD_CHILD_COPY.fields.birthLengthLabel}
                </Label>
                <Input
                  id={birthLengthId}
                  type="number"
                  inputMode="decimal"
                  step={TRACKER_FIELD_LIMITS.birthLengthCm.step}
                  min={TRACKER_FIELD_LIMITS.birthLengthCm.min}
                  max={TRACKER_FIELD_LIMITS.birthLengthCm.max}
                  errorMessage={fieldError(
                    state,
                    "birthLengthCm",
                    form.formState.errors.birthLengthCm?.message,
                  )}
                  {...form.register("birthLengthCm")}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                {ADD_CHILD_COPY.birthStatus.legend}
              </p>
              <input
                type="hidden"
                value={birthStatus}
                {...form.register("birthStatus")}
              />
              <SegmentedControl<BirthStatus>
                ariaLabel={ADD_CHILD_COPY.birthStatus.legend}
                idBase={birthStatusBase}
                value={birthStatus}
                onValueChange={handleBirthStatusChange}
                items={[
                  { id: "term", label: ADD_CHILD_COPY.birthStatus.term },
                  { id: "preterm", label: ADD_CHILD_COPY.birthStatus.preterm },
                ]}
              />
              <div
                {...segmentedPanelProps(birthStatusBase, "term", !isPreterm)}
              >
                <p className="text-xs text-muted-foreground">
                  {ADD_CHILD_COPY.birthStatus.termNote}
                </p>
              </div>
              <div
                {...segmentedPanelProps(birthStatusBase, "preterm", isPreterm)}
                className="space-y-2"
              >
                <Label htmlFor={gestationalAgeId}>
                  {ADD_CHILD_COPY.fields.gestationalAgeLabel}
                </Label>
                <Input
                  id={gestationalAgeId}
                  type="number"
                  inputMode="numeric"
                  step={TRACKER_FIELD_LIMITS.gestationalAgeWeeks.step}
                  min={TRACKER_FIELD_LIMITS.gestationalAgeWeeks.min}
                  max={TRACKER_FIELD_LIMITS.gestationalAgeWeeks.max}
                  hint={ADD_CHILD_COPY.fields.gestationalAgeHint}
                  errorMessage={fieldError(
                    state,
                    "gestationalAgeWeeks",
                    form.formState.errors.gestationalAgeWeeks?.message,
                  )}
                  {...form.register("gestationalAgeWeeks")}
                />
              </div>
            </div>
          </div>
        </details>
      ) : (
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-foreground">
            {ADD_CHILD_COPY.birthSectionTitle}
          </legend>
          <p className="text-xs text-muted-foreground">
            {ADD_CHILD_COPY.birthSectionHint}
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={birthWeightId}>
                {ADD_CHILD_COPY.fields.birthWeightLabel}
              </Label>
              <Input
                id={birthWeightId}
                type="number"
                inputMode="decimal"
                step={TRACKER_FIELD_LIMITS.birthWeightKg.step}
                min={TRACKER_FIELD_LIMITS.birthWeightKg.min}
                max={TRACKER_FIELD_LIMITS.birthWeightKg.max}
                errorMessage={fieldError(
                  state,
                  "birthWeightKg",
                  form.formState.errors.birthWeightKg?.message,
                )}
                {...form.register("birthWeightKg")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={birthLengthId}>
                {ADD_CHILD_COPY.fields.birthLengthLabel}
              </Label>
              <Input
                id={birthLengthId}
                type="number"
                inputMode="decimal"
                step={TRACKER_FIELD_LIMITS.birthLengthCm.step}
                min={TRACKER_FIELD_LIMITS.birthLengthCm.min}
                max={TRACKER_FIELD_LIMITS.birthLengthCm.max}
                errorMessage={fieldError(
                  state,
                  "birthLengthCm",
                  form.formState.errors.birthLengthCm?.message,
                )}
                {...form.register("birthLengthCm")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              {ADD_CHILD_COPY.birthStatus.legend}
            </p>
            <input
              type="hidden"
              value={birthStatus}
              {...form.register("birthStatus")}
            />
            <SegmentedControl<BirthStatus>
              ariaLabel={ADD_CHILD_COPY.birthStatus.legend}
              idBase={birthStatusBase}
              value={birthStatus}
              onValueChange={handleBirthStatusChange}
              items={[
                { id: "term", label: ADD_CHILD_COPY.birthStatus.term },
                { id: "preterm", label: ADD_CHILD_COPY.birthStatus.preterm },
              ]}
            />
            <div {...segmentedPanelProps(birthStatusBase, "term", !isPreterm)}>
              <p className="text-xs text-muted-foreground">
                {ADD_CHILD_COPY.birthStatus.termNote}
              </p>
            </div>
            <div
              {...segmentedPanelProps(birthStatusBase, "preterm", isPreterm)}
              className="space-y-2"
            >
              <Label htmlFor={gestationalAgeId}>
                {ADD_CHILD_COPY.fields.gestationalAgeLabel}
              </Label>
              <Input
                id={gestationalAgeId}
                type="number"
                inputMode="numeric"
                step={TRACKER_FIELD_LIMITS.gestationalAgeWeeks.step}
                min={TRACKER_FIELD_LIMITS.gestationalAgeWeeks.min}
                max={TRACKER_FIELD_LIMITS.gestationalAgeWeeks.max}
                hint={ADD_CHILD_COPY.fields.gestationalAgeHint}
                errorMessage={fieldError(
                  state,
                  "gestationalAgeWeeks",
                  form.formState.errors.gestationalAgeWeeks?.message,
                )}
                {...form.register("gestationalAgeWeeks")}
              />
            </div>
          </div>
        </fieldset>
      )}

      <div className="space-y-2">
        <Label htmlFor={notesId}>{ADD_CHILD_COPY.fields.notesLabel}</Label>
        <Textarea
          id={notesId}
          rows={3}
          maxLength={TRACKER_FIELD_LIMITS.noteMaxLength}
          hint={ADD_CHILD_COPY.fields.notesHint}
          errorMessage={fieldError(
            state,
            "notes",
            form.formState.errors.notes?.message,
          )}
          {...form.register("notes")}
        />
      </div>

      {hasClientErrors ? (
        <FeedbackBanner tone="error">
          <strong>{TRACKER_VALIDATION_COPY.summaryTitle}</strong>
          <span className="block">
            {TRACKER_VALIDATION_COPY.summaryDescription}
          </span>
        </FeedbackBanner>
      ) : generalError ? (
        <FeedbackBanner tone="error">{generalError}</FeedbackBanner>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "ghost" })}
        >
          {ADD_CHILD_COPY.cancel}
        </Link>
        <SubmitButton label={submitLabel} pending={pending} />
      </div>
    </form>
  );
}
