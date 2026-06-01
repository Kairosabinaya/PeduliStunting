"use client";

import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { CEK_CEPAT_COPY } from "@/config/cek-cepat";
import { TRACKER_FIELD_LIMITS } from "@/config/tracker";
import { todayIso } from "@/lib/today";

export type CekCepatInputMode = "birth-date" | "age-months";
type NumericDraft = number | string | null;

export interface CekCepatFormValues {
  readonly sex: "L" | "P" | null;
  readonly mode: CekCepatInputMode;
  readonly birthDate: string | null;
  readonly ageMonths: NumericDraft;
  readonly weightKg: NumericDraft;
  readonly heightCm: NumericDraft;
}

export interface CekCepatFormSubmitPayload {
  readonly sex: "L" | "P";
  readonly ageMonths: number;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
}

export interface CekCepatFormProps {
  readonly defaultValues: CekCepatFormValues;
  readonly submitting: boolean;
  readonly onValuesChange: (values: CekCepatFormValues) => void;
  readonly onSubmit: (payload: CekCepatFormSubmitPayload) => void;
  readonly onReset: () => void;
}

export function CekCepatForm({
  defaultValues,
  submitting,
  onValuesChange,
  onSubmit,
  onReset,
}: CekCepatFormProps) {
  const [values, setValues] = useState<CekCepatFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const birthDateId = useId();
  const ageId = useId();
  const weightId = useId();
  const heightId = useId();

  function commit(next: CekCepatFormValues) {
    setValues(next);
    onValuesChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate(values);
    setErrors(validation.errors);
    if (!validation.payload) return;
    onSubmit(validation.payload);
  }

  function handleReset() {
    const cleared: CekCepatFormValues = {
      sex: null,
      mode: values.mode,
      birthDate: null,
      ageMonths: null,
      weightKg: null,
      heightCm: null,
    };
    setErrors({});
    commit(cleared);
    onReset();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label={CEK_CEPAT_COPY.panelTitle}
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium leading-none text-foreground">
          {CEK_CEPAT_COPY.fieldLabels.sex}
        </legend>
        <div className="flex gap-2" role="radiogroup">
          <SexOption
            value="L"
            label={CEK_CEPAT_COPY.fieldLabels.sexMale}
            current={values.sex}
            onSelect={(sex) => commit({ ...values, sex })}
          />
          <SexOption
            value="P"
            label={CEK_CEPAT_COPY.fieldLabels.sexFemale}
            current={values.sex}
            onSelect={(sex) => commit({ ...values, sex })}
          />
        </div>
        {errors.sex ? (
          <p className="text-xs text-danger" role="alert">
            {errors.sex}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium leading-none text-foreground">
          {CEK_CEPAT_COPY.fieldLabels.inputMode}
        </legend>
        <div className="flex gap-2" role="radiogroup">
          <ModeOption
            value="birth-date"
            label={CEK_CEPAT_COPY.fieldLabels.inputModeBirthDate}
            current={values.mode}
            onSelect={(mode) => commit({ ...values, mode })}
          />
          <ModeOption
            value="age-months"
            label={CEK_CEPAT_COPY.fieldLabels.inputModeAgeMonths}
            current={values.mode}
            onSelect={(mode) => commit({ ...values, mode })}
          />
        </div>
      </fieldset>

      {values.mode === "birth-date" ? (
        <div className="space-y-1">
          <Label htmlFor={birthDateId}>
            {CEK_CEPAT_COPY.fieldLabels.birthDate}
          </Label>
          <Input
            id={birthDateId}
            type="date"
            value={values.birthDate ?? ""}
            max={todayIso()}
            errorMessage={errors.birthDate}
            onChange={(event) =>
              commit({ ...values, birthDate: event.target.value || null })
            }
          />
        </div>
      ) : (
        <div className="space-y-1">
          <Label htmlFor={ageId}>{CEK_CEPAT_COPY.fieldLabels.ageMonths}</Label>
          <Input
            id={ageId}
            type="number"
            inputMode="numeric"
            step={TRACKER_FIELD_LIMITS.quickScreeningAgeMonths.step}
            min={TRACKER_FIELD_LIMITS.quickScreeningAgeMonths.min}
            max={TRACKER_FIELD_LIMITS.quickScreeningAgeMonths.max}
            placeholder={CEK_CEPAT_COPY.fieldPlaceholders.ageMonths}
            value={values.ageMonths ?? ""}
            errorMessage={errors.ageMonths}
            hint={CEK_CEPAT_COPY.fieldHints.ageRange}
            onChange={(event) =>
              commit({
                ...values,
                ageMonths: parseIntegerInput(event.target.value),
              })
            }
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col justify-end gap-1">
          <Label htmlFor={weightId}>
            {CEK_CEPAT_COPY.fieldLabels.weightKg}
          </Label>
          <Input
            id={weightId}
            type="number"
            inputMode="decimal"
            step={TRACKER_FIELD_LIMITS.quickScreeningWeightKg.step}
            min={TRACKER_FIELD_LIMITS.quickScreeningWeightKg.min}
            max={TRACKER_FIELD_LIMITS.quickScreeningWeightKg.max}
            placeholder={CEK_CEPAT_COPY.fieldPlaceholders.weightKg}
            value={values.weightKg ?? ""}
            errorMessage={errors.weightKg}
            onChange={(event) =>
              commit({
                ...values,
                weightKg: parseDecimalInput(event.target.value),
              })
            }
          />
        </div>
        <div className="flex flex-col justify-end gap-1">
          <Label htmlFor={heightId}>
            {CEK_CEPAT_COPY.fieldLabels.heightCm}
          </Label>
          <Input
            id={heightId}
            type="number"
            inputMode="decimal"
            step={TRACKER_FIELD_LIMITS.quickScreeningHeightCm.step}
            min={TRACKER_FIELD_LIMITS.quickScreeningHeightCm.min}
            max={TRACKER_FIELD_LIMITS.quickScreeningHeightCm.max}
            placeholder={CEK_CEPAT_COPY.fieldPlaceholders.heightCm}
            value={values.heightCm ?? ""}
            errorMessage={errors.heightCm}
            hint={CEK_CEPAT_COPY.fieldHints.height}
            onChange={(event) =>
              commit({
                ...values,
                heightCm: parseDecimalInput(event.target.value),
              })
            }
          />
        </div>
      </div>

      {errors.combined ? (
        <p className="text-xs text-danger" role="alert">
          {errors.combined}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          size="sm"
          loading={submitting}
          disabled={submitting}
        >
          {submitting
            ? CEK_CEPAT_COPY.buttons.submitting
            : CEK_CEPAT_COPY.buttons.submit}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={submitting}
        >
          {CEK_CEPAT_COPY.buttons.reset}
        </Button>
      </div>
    </form>
  );
}

function SexOption({
  value,
  label,
  current,
  onSelect,
}: {
  readonly value: "L" | "P";
  readonly label: string;
  readonly current: "L" | "P" | null;
  readonly onSelect: (next: "L" | "P") => void;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={
        selected
          ? "flex-1 rounded-md border border-primary bg-brand-50 px-3 py-2 text-sm font-medium text-primary dark:bg-brand-900"
          : "flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
      }
    >
      {label}
    </button>
  );
}

function ModeOption({
  value,
  label,
  current,
  onSelect,
}: {
  readonly value: CekCepatInputMode;
  readonly label: string;
  readonly current: CekCepatInputMode;
  readonly onSelect: (next: CekCepatInputMode) => void;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={
        selected
          ? "flex-1 rounded-md border border-primary bg-brand-50 px-3 py-2 text-sm font-medium text-primary dark:bg-brand-900"
          : "flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
      }
    >
      {label}
    </button>
  );
}

function parseIntegerInput(value: string): NumericDraft {
  if (value.trim().length === 0) return null;
  if (!/^-?\d+$/u.test(value.trim())) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDecimalInput(value: string): NumericDraft {
  if (value.trim().length === 0) return null;
  if (!/^-?\d+(?:[.,]\d+)?$/u.test(value.trim())) return value;
  const normalised = value.replace(",", ".");
  const parsed = Number(normalised);
  return Number.isFinite(parsed) ? parsed : null;
}

interface ValidationOutcome {
  readonly errors: Partial<Record<string, string>>;
  readonly payload: CekCepatFormSubmitPayload | null;
}

function validate(values: CekCepatFormValues): ValidationOutcome {
  const errors: Record<string, string> = {};

  if (values.sex === null) {
    errors.sex = CEK_CEPAT_COPY.fieldLabels.sex;
  }

  let resolvedAgeMonths: number | null = null;
  if (values.mode === "birth-date") {
    if (values.birthDate === null || values.birthDate.length === 0) {
      errors.birthDate = CEK_CEPAT_COPY.validation.birthDateInvalid;
    } else {
      const parsed = new Date(`${values.birthDate}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        errors.birthDate = CEK_CEPAT_COPY.validation.birthDateInvalid;
      } else if (parsed.getTime() > Date.now()) {
        errors.birthDate = CEK_CEPAT_COPY.validation.birthDateFuture;
      } else {
        resolvedAgeMonths = monthsSince(parsed);
        if (
          resolvedAgeMonths < 0 ||
          resolvedAgeMonths > TRACKER_FIELD_LIMITS.quickScreeningAgeMonths.max
        ) {
          errors.birthDate = CEK_CEPAT_COPY.validation.ageInvalid;
          resolvedAgeMonths = null;
        }
      }
    }
  } else {
    if (
      values.ageMonths === null ||
      typeof values.ageMonths !== "number" ||
      !Number.isInteger(values.ageMonths) ||
      values.ageMonths < TRACKER_FIELD_LIMITS.quickScreeningAgeMonths.min ||
      values.ageMonths > TRACKER_FIELD_LIMITS.quickScreeningAgeMonths.max
    ) {
      errors.ageMonths = CEK_CEPAT_COPY.validation.ageInvalid;
    } else {
      resolvedAgeMonths = values.ageMonths;
    }
  }

  if (
    values.weightKg !== null &&
    (typeof values.weightKg !== "number" ||
      !Number.isFinite(values.weightKg) ||
      values.weightKg < TRACKER_FIELD_LIMITS.quickScreeningWeightKg.min ||
      values.weightKg > TRACKER_FIELD_LIMITS.quickScreeningWeightKg.max)
  ) {
    errors.weightKg = CEK_CEPAT_COPY.validation.weightInvalid;
  }
  if (
    values.heightCm !== null &&
    (typeof values.heightCm !== "number" ||
      !Number.isFinite(values.heightCm) ||
      values.heightCm < TRACKER_FIELD_LIMITS.quickScreeningHeightCm.min ||
      values.heightCm > TRACKER_FIELD_LIMITS.quickScreeningHeightCm.max)
  ) {
    errors.heightCm = CEK_CEPAT_COPY.validation.heightInvalid;
  }
  if (values.weightKg === null && values.heightCm === null) {
    errors.combined = CEK_CEPAT_COPY.validation.weightRequiredOrHeight;
  }

  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors || resolvedAgeMonths === null || values.sex === null) {
    return { errors, payload: null };
  }

  return {
    errors: {},
    payload: {
      sex: values.sex,
      ageMonths: resolvedAgeMonths,
      weightKg: numericOrNull(values.weightKg),
      heightCm: numericOrNull(values.heightCm),
    },
  };
}

function numericOrNull(value: NumericDraft): number | null {
  return typeof value === "number" ? value : null;
}

function monthsSince(birth: Date): number {
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const days = now.getDate() - birth.getDate();
  return years * 12 + months - (days < 0 ? 1 : 0);
}
