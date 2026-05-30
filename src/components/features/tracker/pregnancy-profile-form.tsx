"use client";

import { useActionState, useId } from "react";

import { savePregnancyProfile } from "@/app/(app)/tracker/kehamilan/actions";
import {
  INITIAL_PREGNANCY_PROFILE_STATE,
  type PregnancyProfileFormState,
} from "@/app/(app)/tracker/kehamilan/_lib/pregnancy-form-state";
import type { PregnancyDto } from "@/application/pregnancy/dtos";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Textarea } from "@/components/primitives/textarea";
import { PREGNANCY_PAGE_COPY, PREGNANCY_PROFILE_COPY } from "@/config/tracker";

export interface PregnancyProfileFormProps {
  readonly pregnancy: PregnancyDto | null;
}

function fieldError(
  state: PregnancyProfileFormState | null,
  field: string,
): string | undefined {
  return state?.fieldErrors?.[field]?.[0];
}

/**
 * Form profil kehamilan: HPHT, perkiraan lahir, berat awal, tinggi ibu,
 * catatan. Create saat belum ada pregnancy aktif, update saat sudah ada.
 */
export function PregnancyProfileForm({ pregnancy }: PregnancyProfileFormProps) {
  const [state, action, pending] = useActionState<
    PregnancyProfileFormState | null,
    FormData
  >(savePregnancyProfile, INITIAL_PREGNANCY_PROFILE_STATE);

  const hphtId = useId();
  const expectedDueId = useId();
  const initialWeightId = useId();
  const heightId = useId();
  const notesId = useId();

  const current = state?.record ?? pregnancy;

  return (
    <form action={action} className="space-y-4">
      {current ? (
        <input type="hidden" name="pregnancyId" value={current.id} />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={hphtId} required>
            {PREGNANCY_PROFILE_COPY.hpht}
          </Label>
          <Input
            id={hphtId}
            name="hpht"
            type="date"
            defaultValue={current?.hpht ?? ""}
            required
            errorMessage={fieldError(state, "hpht")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={expectedDueId}>
            {PREGNANCY_PROFILE_COPY.expectedDue}
          </Label>
          <Input
            id={expectedDueId}
            name="expectedDue"
            type="date"
            defaultValue={current?.expectedDue ?? ""}
            errorMessage={fieldError(state, "expectedDue")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={initialWeightId}>
            {PREGNANCY_PROFILE_COPY.initialWeightKg}
          </Label>
          <Input
            id={initialWeightId}
            name="initialWeightKg"
            type="number"
            step="0.1"
            inputMode="decimal"
            defaultValue={current?.initialWeightKg ?? ""}
            errorMessage={fieldError(state, "initialWeightKg")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={heightId}>{PREGNANCY_PROFILE_COPY.heightCm}</Label>
          <Input
            id={heightId}
            name="heightCm"
            type="number"
            step="0.1"
            inputMode="decimal"
            defaultValue={current?.heightCm ?? ""}
            errorMessage={fieldError(state, "heightCm")}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={notesId}>{PREGNANCY_PROFILE_COPY.notes}</Label>
        <Textarea
          id={notesId}
          name="notes"
          rows={3}
          maxLength={1000}
          hint={PREGNANCY_PROFILE_COPY.notesHint}
          defaultValue={current?.notes ?? ""}
          errorMessage={fieldError(state, "notes")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" loading={pending} disabled={pending}>
          {pending
            ? PREGNANCY_PAGE_COPY.saving
            : PREGNANCY_PROFILE_COPY.saveCta}
        </Button>
      </div>

      {state && !state.ok && state.message ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
