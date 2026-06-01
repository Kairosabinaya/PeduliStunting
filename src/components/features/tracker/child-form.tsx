"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

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
import { ADD_CHILD_COPY } from "@/config/tracker";

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

function SubmitButton({ label }: { readonly label: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} disabled={status.pending}>
      {label}
    </Button>
  );
}

function fieldError(
  state: AddChildFormState | null,
  field: string,
): string | undefined {
  return state?.fieldErrors?.[field]?.[0];
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

  const [birthStatus, setBirthStatus] = useState<BirthStatus>(
    defaults.isPremature ? "preterm" : "term",
  );

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

  return (
    <form action={formAction} className="space-y-8" noValidate>
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
              name="name"
              type="text"
              autoComplete="off"
              maxLength={80}
              required
              defaultValue={defaults.name}
              placeholder={ADD_CHILD_COPY.fields.namePlaceholder}
              errorMessage={fieldError(state, "name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={sexId} required>
              {ADD_CHILD_COPY.fields.sexLabel}
            </Label>
            <Select
              id={sexId}
              name="sex"
              defaultValue={defaults.sex}
              required
              errorMessage={fieldError(state, "sex")}
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
              name="birthDate"
              type="date"
              required
              defaultValue={defaults.birthDate}
              errorMessage={fieldError(state, "birthDate")}
            />
          </div>
        </div>
      </fieldset>

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
              name="birthWeightKg"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.5"
              max="10"
              defaultValue={defaults.birthWeightKg}
              errorMessage={fieldError(state, "birthWeightKg")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={birthLengthId}>
              {ADD_CHILD_COPY.fields.birthLengthLabel}
            </Label>
            <Input
              id={birthLengthId}
              name="birthLengthCm"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="20"
              max="80"
              defaultValue={defaults.birthLengthCm}
              errorMessage={fieldError(state, "birthLengthCm")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            {ADD_CHILD_COPY.birthStatus.legend}
          </p>
          <input type="hidden" name="birthStatus" value={birthStatus} />
          <SegmentedControl<BirthStatus>
            ariaLabel={ADD_CHILD_COPY.birthStatus.legend}
            idBase={birthStatusBase}
            value={birthStatus}
            onValueChange={setBirthStatus}
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
              name="gestationalAgeWeeks"
              type="number"
              inputMode="numeric"
              step="1"
              min="20"
              max="36"
              defaultValue={defaults.gestationalAgeWeeks}
              hint={ADD_CHILD_COPY.fields.gestationalAgeHint}
              errorMessage={fieldError(state, "gestationalAgeWeeks")}
            />
          </div>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor={notesId}>{ADD_CHILD_COPY.fields.notesLabel}</Label>
        <Textarea
          id={notesId}
          name="notes"
          rows={3}
          maxLength={500}
          defaultValue={defaults.notes}
          hint={ADD_CHILD_COPY.fields.notesHint}
          errorMessage={fieldError(state, "notes")}
        />
      </div>

      {generalError ? (
        <FeedbackBanner tone="error">{generalError}</FeedbackBanner>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "ghost" })}
        >
          {ADD_CHILD_COPY.cancel}
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
