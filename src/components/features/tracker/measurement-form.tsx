"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import { Textarea } from "@/components/primitives/textarea";
import { MEASUREMENTS_COPY } from "@/config/tracker";
import { todayIso } from "@/lib/today";

import { addMeasurement } from "@/app/(app)/tracker/anak/[childId]/pengukuran/actions";
import {
  INITIAL_ADD_MEASUREMENT_STATE,
  type AddMeasurementFormState,
} from "@/app/(app)/tracker/anak/[childId]/pengukuran/_lib/add-measurement-state";

export interface MeasurementFormProps {
  readonly childId: string;
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} disabled={status.pending}>
      {status.pending ? MEASUREMENTS_COPY.submitting : MEASUREMENTS_COPY.submit}
    </Button>
  );
}

function fieldError(
  state: AddMeasurementFormState | null,
  field: string,
): string | undefined {
  return state?.fieldErrors?.[field]?.[0];
}

/**
 * Form for recording a single growth measurement. Submits to the
 * `addMeasurement` Server Action via `useActionState`. At least one numeric
 * field is required (enforced server-side by the Zod refine in
 * {@link recordMeasurementInputSchema}); the form surfaces the resulting
 * banner without blocking the user from retrying.
 */
export function MeasurementForm({ childId }: MeasurementFormProps) {
  const boundAction = addMeasurement.bind(null, childId);
  const [state, action] = useActionState<
    AddMeasurementFormState | null,
    FormData
  >(boundAction, INITIAL_ADD_MEASUREMENT_STATE);

  const formRef = useRef<HTMLFormElement | null>(null);

  const measuredAtId = useId();
  const weightId = useId();
  const heightId = useId();
  const measuredLyingId = useId();
  const headCircumferenceId = useId();
  const muacId = useId();
  const noteId = useId();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const generalError =
    state && !state.ok
      ? (state.message ?? MEASUREMENTS_COPY.genericError)
      : null;

  return (
    <form ref={formRef} action={action} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={measuredAtId} required>
            {MEASUREMENTS_COPY.fields.measuredAtLabel}
          </Label>
          <Input
            id={measuredAtId}
            name="measuredAt"
            type="date"
            defaultValue={todayIso()}
            required
            errorMessage={fieldError(state, "measuredAt")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={weightId}>
            {MEASUREMENTS_COPY.fields.weightLabel}
          </Label>
          <Input
            id={weightId}
            name="weightKg"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.5"
            max="60"
            errorMessage={fieldError(state, "weightKg")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={heightId}>
            {MEASUREMENTS_COPY.fields.heightLabel}
          </Label>
          <Input
            id={heightId}
            name="heightCm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="30"
            max="140"
            errorMessage={fieldError(state, "heightCm")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={measuredLyingId}>
            {MEASUREMENTS_COPY.fields.measuredLyingLabel}
          </Label>
          <Select
            id={measuredLyingId}
            name="measuredLying"
            defaultValue=""
            errorMessage={fieldError(state, "measuredLying")}
          >
            <option value="">—</option>
            <option value="standing">
              {MEASUREMENTS_COPY.fields.measuredLyingStanding}
            </option>
            <option value="lying">
              {MEASUREMENTS_COPY.fields.measuredLyingLying}
            </option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={headCircumferenceId}>
            {MEASUREMENTS_COPY.fields.headCircumferenceLabel}
          </Label>
          <Input
            id={headCircumferenceId}
            name="headCircumferenceCm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="20"
            max="70"
            errorMessage={fieldError(state, "headCircumferenceCm")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={muacId}>{MEASUREMENTS_COPY.fields.muacLabel}</Label>
          <Input
            id={muacId}
            name="muacCm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="5"
            max="40"
            errorMessage={fieldError(state, "muacCm")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={noteId}>{MEASUREMENTS_COPY.fields.noteLabel}</Label>
          <Textarea
            id={noteId}
            name="note"
            rows={3}
            maxLength={500}
            hint={MEASUREMENTS_COPY.fields.noteHint}
            errorMessage={fieldError(state, "note")}
          />
        </div>
      </div>

      {generalError ? (
        <FeedbackBanner tone="error">{generalError}</FeedbackBanner>
      ) : state?.ok ? (
        <FeedbackBanner tone="success">
          {MEASUREMENTS_COPY.successMessage}
        </FeedbackBanner>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}
