"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Textarea } from "@/components/primitives/textarea";
import {
  MEASUREMENTS_COPY,
  TRACKER_FIELD_LIMITS,
  TRACKER_VALIDATION_COPY,
} from "@/config/tracker";
import { todayIso } from "@/lib/today";
import { recordMeasurementFormInputSchema } from "@/schemas/tracking";

import { addMeasurement } from "@/app/(app)/tracker/anak/[childId]/pengukuran/actions";
import {
  INITIAL_ADD_MEASUREMENT_STATE,
  type AddMeasurementFormState,
} from "@/app/(app)/tracker/anak/[childId]/pengukuran/_lib/add-measurement-state";

export interface MeasurementFormProps {
  readonly childId: string;
  readonly childBirthDate: string;
  /**
   * Called once after a measurement is saved successfully. The modal wrapper
   * uses this to close itself; when omitted the form just shows its success
   * banner in place. Keep the reference stable (e.g. `useCallback`).
   */
  readonly onSaved?: () => void;
}

type MeasurementFormFields = z.input<typeof recordMeasurementFormInputSchema>;
type MeasurementFormOutput = z.output<typeof recordMeasurementFormInputSchema>;

function SubmitButton({ pending }: { readonly pending: boolean }) {
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      {pending ? MEASUREMENTS_COPY.submitting : MEASUREMENTS_COPY.submit}
    </Button>
  );
}

function fieldError(
  state: AddMeasurementFormState | null,
  field: string,
  clientMessage?: string | undefined,
): string | undefined {
  return clientMessage ?? state?.fieldErrors?.[field]?.[0];
}

/**
 * Form for recording a single growth measurement. Submits to the
 * `addMeasurement` Server Action via `useActionState`. At least one numeric
 * field is required (enforced server-side by the Zod refine in
 * {@link recordMeasurementInputSchema}); the form surfaces the resulting
 * banner without blocking the user from retrying.
 */
export function MeasurementForm({
  childId,
  childBirthDate,
  onSaved,
}: MeasurementFormProps) {
  const boundAction = addMeasurement.bind(null, childId);
  const [state, action] = useActionState<
    AddMeasurementFormState | null,
    FormData
  >(boundAction, INITIAL_ADD_MEASUREMENT_STATE);
  const [pending, startTransition] = useTransition();

  const defaultValues = useMemo<MeasurementFormFields>(
    () => ({
      childId,
      childBirthDate,
      measuredAt: todayIso(),
      weightKg: "",
      heightCm: "",
      headCircumferenceCm: "",
      muacCm: "",
      note: "",
    }),
    [childBirthDate, childId],
  );
  const form = useForm<MeasurementFormFields, undefined, MeasurementFormOutput>(
    {
      resolver: zodResolver(recordMeasurementFormInputSchema),
      defaultValues,
      shouldFocusError: true,
    },
  );

  const measuredAtId = useId();
  const weightId = useId();
  const heightId = useId();
  const headCircumferenceId = useId();
  const muacId = useId();
  const noteId = useId();

  useEffect(() => {
    if (state?.ok) {
      form.reset(defaultValues);
      onSaved?.();
    }
  }, [defaultValues, form, state, onSaved]);

  const generalError =
    state && !state.ok
      ? (state.message ?? MEASUREMENTS_COPY.genericError)
      : null;
  const hasClientErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <form
      onSubmit={form.handleSubmit((_values, event) => {
        const node = event?.target;
        if (!(node instanceof HTMLFormElement)) return;
        startTransition(() => {
          action(new FormData(node));
        });
      })}
      className="space-y-6"
      noValidate
    >
      <input type="hidden" {...form.register("childId")} />
      <input type="hidden" {...form.register("childBirthDate")} />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={measuredAtId} required>
            {MEASUREMENTS_COPY.fields.measuredAtLabel}
          </Label>
          <Input
            id={measuredAtId}
            type="date"
            min={childBirthDate}
            max={todayIso()}
            required
            errorMessage={fieldError(
              state,
              "measuredAt",
              form.formState.errors.measuredAt?.message,
            )}
            {...form.register("measuredAt")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={weightId}>
            {MEASUREMENTS_COPY.fields.weightLabel}
          </Label>
          <Input
            id={weightId}
            type="number"
            inputMode="decimal"
            step={TRACKER_FIELD_LIMITS.measurementWeightKg.step}
            min={TRACKER_FIELD_LIMITS.measurementWeightKg.min}
            max={TRACKER_FIELD_LIMITS.measurementWeightKg.max}
            errorMessage={fieldError(
              state,
              "weightKg",
              form.formState.errors.weightKg?.message,
            )}
            {...form.register("weightKg")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={heightId}>
            {MEASUREMENTS_COPY.fields.heightLabel}
          </Label>
          <Input
            id={heightId}
            type="number"
            inputMode="decimal"
            step={TRACKER_FIELD_LIMITS.measurementHeightCm.step}
            min={TRACKER_FIELD_LIMITS.measurementHeightCm.min}
            max={TRACKER_FIELD_LIMITS.measurementHeightCm.max}
            errorMessage={fieldError(
              state,
              "heightCm",
              form.formState.errors.heightCm?.message,
            )}
            {...form.register("heightCm")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={headCircumferenceId}>
            {MEASUREMENTS_COPY.fields.headCircumferenceLabel}
          </Label>
          <Input
            id={headCircumferenceId}
            type="number"
            inputMode="decimal"
            step={TRACKER_FIELD_LIMITS.measurementHeadCircumferenceCm.step}
            min={TRACKER_FIELD_LIMITS.measurementHeadCircumferenceCm.min}
            max={TRACKER_FIELD_LIMITS.measurementHeadCircumferenceCm.max}
            errorMessage={fieldError(
              state,
              "headCircumferenceCm",
              form.formState.errors.headCircumferenceCm?.message,
            )}
            {...form.register("headCircumferenceCm")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={muacId}>{MEASUREMENTS_COPY.fields.muacLabel}</Label>
          <Input
            id={muacId}
            type="number"
            inputMode="decimal"
            step={TRACKER_FIELD_LIMITS.measurementMuacCm.step}
            min={TRACKER_FIELD_LIMITS.measurementMuacCm.min}
            max={TRACKER_FIELD_LIMITS.measurementMuacCm.max}
            errorMessage={fieldError(
              state,
              "muacCm",
              form.formState.errors.muacCm?.message,
            )}
            {...form.register("muacCm")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={noteId}>{MEASUREMENTS_COPY.fields.noteLabel}</Label>
          <Textarea
            id={noteId}
            rows={3}
            maxLength={TRACKER_FIELD_LIMITS.noteMaxLength}
            hint={MEASUREMENTS_COPY.fields.noteHint}
            errorMessage={fieldError(
              state,
              "note",
              form.formState.errors.note?.message,
            )}
            {...form.register("note")}
          />
        </div>
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
      ) : state?.ok ? (
        <FeedbackBanner tone="success">
          {MEASUREMENTS_COPY.successMessage}
        </FeedbackBanner>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <SubmitButton pending={pending} />
      </div>
    </form>
  );
}
