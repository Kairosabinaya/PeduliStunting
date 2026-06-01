"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import { upsertChildImmunization } from "@/app/(app)/tracker/anak/[childId]/imunisasi/actions";
import {
  INITIAL_UPSERT_IMMUNIZATION_STATE,
  type UpsertImmunizationFormState,
} from "@/app/(app)/tracker/anak/[childId]/imunisasi/_lib/upsert-immunization-state";

import type {
  ChildImmunizationDto,
  ImmunizationDto,
} from "@/application/health-plan/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import { Textarea } from "@/components/primitives/textarea";
import { IMMUNIZATION_COPY, IMMUNIZATION_STATUS_LABEL } from "@/config/tracker";
import { CHILD_IMMUNIZATION_STATUSES } from "@/domain/health-plan/entities/child-immunization";

export interface ImmunizationChecklistProps {
  readonly childId: string;
  readonly schedule: readonly ImmunizationDto[];
  readonly records: readonly ChildImmunizationDto[];
}

function indexByCode(
  records: readonly ChildImmunizationDto[],
): ReadonlyMap<string, ChildImmunizationDto> {
  const map = new Map<string, ChildImmunizationDto>();
  for (const record of records) {
    map.set(record.immunizationCode, record);
  }
  return map;
}

function fieldError(
  state: UpsertImmunizationFormState | null,
  field: string,
): string | undefined {
  return state?.fieldErrors?.[field]?.[0];
}

function RowSubmit({
  state,
}: {
  readonly state: UpsertImmunizationFormState | null;
}) {
  const status = useFormStatus();
  const label = status.pending
    ? IMMUNIZATION_COPY.saving
    : state?.ok
      ? IMMUNIZATION_COPY.saved
      : "Simpan";
  return (
    <Button
      type="submit"
      variant="secondary"
      size="sm"
      loading={status.pending}
      disabled={status.pending}
    >
      {label}
    </Button>
  );
}

function ImmunizationRow({
  childId,
  item,
  record,
}: {
  readonly childId: string;
  readonly item: ImmunizationDto;
  readonly record: ChildImmunizationDto | undefined;
}) {
  const boundAction = upsertChildImmunization.bind(null, childId, item.code);
  const [state, action] = useActionState<
    UpsertImmunizationFormState | null,
    FormData
  >(boundAction, INITIAL_UPSERT_IMMUNIZATION_STATE);

  const statusId = useId();
  const givenAtId = useId();
  const noteId = useId();

  const currentStatus = state?.record?.status ?? record?.status ?? "pending";
  const currentGivenAt = state?.record?.givenAt ?? record?.givenAt ?? "";
  const currentNote = state?.record?.note ?? record?.note ?? "";

  const generalError =
    state && !state.ok ? (state.message ?? IMMUNIZATION_COPY.errorSave) : null;

  const ageLabel =
    item.recommendedAgeMonths !== null
      ? `${item.recommendedAgeMonths} ${IMMUNIZATION_COPY.recommendedAgeUnit}`
      : null;

  return (
    <li className="space-y-3 rounded-xl border border-border bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.doseNumber !== null ? (
              <Badge tone="neutral">
                {IMMUNIZATION_COPY.doseLabel} {item.doseNumber}
              </Badge>
            ) : null}
            {ageLabel ? <span>{ageLabel}</span> : null}
          </div>
        </div>
      </div>

      {item.notes ? (
        <p className="text-xs text-muted-foreground">{item.notes}</p>
      ) : null}

      <form action={action} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={statusId}>{IMMUNIZATION_COPY.statusLabel}</Label>
            <Select
              id={statusId}
              name="status"
              key={currentStatus}
              defaultValue={currentStatus}
              errorMessage={fieldError(state, "status")}
            >
              {CHILD_IMMUNIZATION_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {IMMUNIZATION_STATUS_LABEL[value]}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={givenAtId}>{IMMUNIZATION_COPY.givenAtLabel}</Label>
            <Input
              id={givenAtId}
              name="givenAt"
              type="date"
              defaultValue={currentGivenAt}
              errorMessage={fieldError(state, "givenAt")}
            />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor={noteId}>{IMMUNIZATION_COPY.noteLabel}</Label>
            <Textarea
              id={noteId}
              name="note"
              rows={2}
              maxLength={500}
              defaultValue={currentNote}
              errorMessage={fieldError(state, "note")}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {generalError ? (
            <p className="mr-auto text-xs text-danger">{generalError}</p>
          ) : state?.ok ? (
            <p className="mr-auto text-xs text-success">
              {IMMUNIZATION_COPY.saved}
            </p>
          ) : null}
          <RowSubmit state={state} />
        </div>
      </form>
    </li>
  );
}

/**
 * Renders the public immunization schedule as a checklist, with one form per
 * row that submits to the `upsertChildImmunization` Server Action. The action
 * is bound per row with `childId` and `immunizationCode` so each row owns its
 * own `useActionState` and feedback banner without cross-talk.
 */
export function ImmunizationChecklist({
  childId,
  schedule,
  records,
}: ImmunizationChecklistProps) {
  if (schedule.length === 0) {
    return (
      <EmptyState
        title={IMMUNIZATION_COPY.emptyTitle}
        description={IMMUNIZATION_COPY.emptyDescription}
      />
    );
  }

  const byCode = indexByCode(records);

  return (
    <ol className="space-y-3">
      {schedule.map((item) => (
        <ImmunizationRow
          key={item.code}
          childId={childId}
          item={item}
          record={byCode.get(item.code)}
        />
      ))}
    </ol>
  );
}
