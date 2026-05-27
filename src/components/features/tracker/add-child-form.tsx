"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import { Button, buttonVariants } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import { Textarea } from "@/components/primitives/textarea";
import { ADD_CHILD_COPY, TRACKER_ROUTE } from "@/config/tracker";

import { createChild } from "@/app/(app)/tracker/actions";
import {
  INITIAL_ADD_CHILD_STATE,
  type AddChildFormState,
} from "@/app/(app)/tracker/_lib/add-child-state";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending} disabled={status.pending}>
      {ADD_CHILD_COPY.submit}
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
 * Form for creating a child profile. Uses `useActionState` so React owns the
 * pending state and the server-side validation result is rendered without
 * extra round trips. On success the Server Action redirects to the child's
 * detail page; on failure field-level errors are surfaced inline.
 */
export function AddChildForm() {
  const [state, action] = useActionState<AddChildFormState | null, FormData>(
    createChild,
    INITIAL_ADD_CHILD_STATE,
  );

  const nameId = useId();
  const sexId = useId();
  const birthDateId = useId();
  const birthWeightId = useId();
  const birthLengthId = useId();
  const gestationalAgeId = useId();
  const notesId = useId();

  const generalError =
    state && !state.ok && !state.fieldErrors
      ? (state.message ?? ADD_CHILD_COPY.genericError)
      : null;

  return (
    <form action={action} className="space-y-6" noValidate>
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
            defaultValue=""
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
            errorMessage={fieldError(state, "birthDate")}
          />
        </div>

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
            errorMessage={fieldError(state, "birthLengthCm")}
          />
        </div>

        <div className="space-y-2">
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
            max="45"
            errorMessage={fieldError(state, "gestationalAgeWeeks")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={notesId}>{ADD_CHILD_COPY.fields.notesLabel}</Label>
          <Textarea
            id={notesId}
            name="notes"
            rows={3}
            maxLength={500}
            hint={ADD_CHILD_COPY.fields.notesHint}
            errorMessage={fieldError(state, "notes")}
          />
        </div>
      </div>

      {generalError ? (
        <FeedbackBanner tone="error">{generalError}</FeedbackBanner>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={TRACKER_ROUTE}
          className={buttonVariants({ variant: "ghost" })}
        >
          {ADD_CHILD_COPY.cancel}
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
