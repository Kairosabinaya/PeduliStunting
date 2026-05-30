"use client";

import { useActionState, useMemo, useTransition } from "react";

import {
  deleteNutritionEvent,
  recordNutritionEvent,
} from "@/app/(app)/tracker/anak/[childId]/gizi/actions";
import {
  INITIAL_NUTRITION_FORM_STATE,
  type NutritionFormState,
} from "@/app/(app)/tracker/anak/[childId]/gizi/_lib/nutrition-form-state";
import type { NutritionEventDto } from "@/application/health-plan/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import {
  DEWORMING_MAX_AGE_MONTHS,
  DEWORMING_MIN_AGE_MONTHS,
  DEWORMING_TARGET_PER_YEAR,
} from "@/config/nutrition";
import { NUTRITION_DEWORMING_COPY } from "@/config/tracker";
import { readDewormingHistory } from "@/domain/health-plan/services/nutrition-status";
import { todayIso } from "@/lib/today";

export interface NutritionDewormingTabProps {
  readonly childId: string;
  readonly childAgeMonths: number;
  readonly events: readonly NutritionEventDto[];
}

export function NutritionDewormingTab({
  childId,
  childAgeMonths,
  events,
}: NutritionDewormingTabProps) {
  const recordAction = recordNutritionEvent.bind(null, childId);
  const deleteAction = deleteNutritionEvent.bind(null, childId);
  const [recordState, runRecord, recordPending] = useActionState<
    NutritionFormState | null,
    FormData
  >(recordAction, INITIAL_NUTRITION_FORM_STATE);
  const [, runDelete, deletePending] = useActionState<
    NutritionFormState | null,
    FormData
  >(deleteAction, INITIAL_NUTRITION_FORM_STATE);
  const [, startTransition] = useTransition();

  const eligible =
    childAgeMonths >= DEWORMING_MIN_AGE_MONTHS &&
    childAgeMonths <= DEWORMING_MAX_AGE_MONTHS;
  const overAge = childAgeMonths > DEWORMING_MAX_AGE_MONTHS;

  const eventsAfterAction = useMemo(() => {
    if (recordState?.ok && recordState.record) {
      return [
        recordState.record,
        ...events.filter((e) => e.id !== recordState.record?.id),
      ];
    }
    return events;
  }, [events, recordState]);

  const history = readDewormingHistory(eventsAfterAction);

  function submitRecord() {
    const form = new FormData();
    form.set("kind", "deworming");
    form.set("eventDate", todayIso());
    form.set("data", "{}");
    form.set("note", "");
    startTransition(() => {
      runRecord(form);
    });
  }

  function submitDelete(eventDate: string) {
    const form = new FormData();
    form.set("kind", "deworming");
    form.set("eventDate", eventDate);
    startTransition(() => {
      runDelete(form);
    });
  }

  const pending = recordPending || deletePending;

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {NUTRITION_DEWORMING_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {NUTRITION_DEWORMING_COPY.description}
        </p>
      </section>

      {!eligible ? (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-xs text-foreground">
          {overAge
            ? NUTRITION_DEWORMING_COPY.outOfAgeMessage
            : NUTRITION_DEWORMING_COPY.ineligibleMessage}
        </p>
      ) : null}

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">
          {NUTRITION_DEWORMING_COPY.thisYearLabel}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            tone={
              history.current.dosesThisYear >= DEWORMING_TARGET_PER_YEAR
                ? "success"
                : "primary"
            }
          >
            {NUTRITION_DEWORMING_COPY.progressFormat(
              history.current.dosesThisYear,
              DEWORMING_TARGET_PER_YEAR,
            )}
          </Badge>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={submitRecord}
          disabled={pending || !eligible}
          loading={recordPending}
        >
          {recordPending
            ? NUTRITION_DEWORMING_COPY.saving
            : NUTRITION_DEWORMING_COPY.recordCta}
        </Button>
        {recordState && !recordState.ok && recordState.message ? (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
          >
            {recordState.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-2 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">
          {NUTRITION_DEWORMING_COPY.historyHeading}
        </p>
        {history.events.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {NUTRITION_DEWORMING_COPY.noRecords}
          </p>
        ) : (
          <ul className="space-y-1">
            {history.events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-xs"
              >
                <span className="font-medium">{event.eventDate}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => submitDelete(event.eventDate)}
                >
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
