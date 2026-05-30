"use client";

import { useActionState, useTransition } from "react";

import {
  deletePregnancyEvent,
  recordPregnancyEvent,
} from "@/app/(app)/tracker/kehamilan/actions";
import {
  INITIAL_PREGNANCY_EVENT_STATE,
  type PregnancyEventFormState,
} from "@/app/(app)/tracker/kehamilan/_lib/pregnancy-form-state";
import type { PregnancyEventDto } from "@/application/pregnancy/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { PREGNANCY_TTD_COPY } from "@/config/tracker";
import { buildTtdSummary } from "@/domain/pregnancy/services/pregnancy-status";

export interface PregnancyTtdTabProps {
  readonly pregnancyId: string;
  readonly events: readonly PregnancyEventDto[];
}

export function PregnancyTtdTab({ pregnancyId, events }: PregnancyTtdTabProps) {
  const recordAction = recordPregnancyEvent.bind(null, pregnancyId);
  const deleteAction = deletePregnancyEvent.bind(null, pregnancyId);
  const [recordState, runRecord, recordPending] = useActionState<
    PregnancyEventFormState | null,
    FormData
  >(recordAction, INITIAL_PREGNANCY_EVENT_STATE);
  const [, runDelete, deletePending] = useActionState<
    PregnancyEventFormState | null,
    FormData
  >(deleteAction, INITIAL_PREGNANCY_EVENT_STATE);
  const [, startTransition] = useTransition();

  const referenceDate = todayIso();
  const summary = buildTtdSummary(
    recordState?.ok && recordState.record
      ? [
          recordState.record,
          ...events.filter((e) => e.id !== recordState.record?.id),
        ]
      : events,
    referenceDate,
  );

  const pending = recordPending || deletePending;

  function submitRecord() {
    const form = new FormData();
    form.set("kind", "ttd_dose");
    form.set("eventDate", referenceDate);
    form.set("data", "{}");
    form.set("note", "");
    startTransition(() => runRecord(form));
  }

  function submitDelete(eventDate: string) {
    const form = new FormData();
    form.set("kind", "ttd_dose");
    form.set("eventDate", eventDate);
    startTransition(() => runDelete(form));
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {PREGNANCY_TTD_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {PREGNANCY_TTD_COPY.description}
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <Badge tone="primary">
          {PREGNANCY_TTD_COPY.monthlyProgressFormat(summary.dosesThisMonth)}
        </Badge>
        {summary.lastDose ? (
          <span className="text-xs text-muted-foreground">
            {PREGNANCY_TTD_COPY.lastDoseFormat(summary.lastDose.eventDate)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {PREGNANCY_TTD_COPY.noDoseLabel}
          </span>
        )}
        <Button
          type="button"
          size="sm"
          onClick={submitRecord}
          loading={recordPending}
          disabled={pending}
          className="ml-auto"
        >
          {recordPending
            ? PREGNANCY_TTD_COPY.saving
            : PREGNANCY_TTD_COPY.markTodayCta}
        </Button>
      </section>

      <section className="space-y-2 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">
          {PREGNANCY_TTD_COPY.historyHeading}
        </p>
        {summary.history.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {PREGNANCY_TTD_COPY.noDoseLabel}
          </p>
        ) : (
          <ul className="space-y-1">
            {summary.history.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-xs"
              >
                <span className="font-medium">{event.eventDate}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
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

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
