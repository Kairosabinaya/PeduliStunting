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
import { ANC_TARGET_SLOTS } from "@/config/pregnancy";
import { PREGNANCY_ANC_COPY } from "@/config/tracker";
import { buildAncSummary } from "@/domain/pregnancy/services/pregnancy-status";

export interface PregnancyAncTabProps {
  readonly pregnancyId: string;
  readonly events: readonly PregnancyEventDto[];
}

export function PregnancyAncTab({ pregnancyId, events }: PregnancyAncTabProps) {
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

  const summary = buildAncSummary(
    recordState?.ok && recordState.record
      ? [
          recordState.record,
          ...events.filter((e) => e.id !== recordState.record?.id),
        ]
      : events,
  );

  const pending = recordPending || deletePending;

  function submitRecord(
    visitNumber: number,
    byDoctor: boolean,
    hasUsg: boolean,
  ) {
    const form = new FormData();
    form.set("kind", "anc_visit");
    form.set("eventDate", todayIso());
    form.set(
      "data",
      JSON.stringify({
        visit_number: visitNumber,
        by_doctor: byDoctor,
        has_usg: hasUsg,
      }),
    );
    form.set("note", "");
    startTransition(() => runRecord(form));
  }

  function submitDelete(eventDate: string) {
    const form = new FormData();
    form.set("kind", "anc_visit");
    form.set("eventDate", eventDate);
    startTransition(() => runDelete(form));
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {PREGNANCY_ANC_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {PREGNANCY_ANC_COPY.description}
        </p>
        <Badge
          tone={summary.completed === summary.target ? "success" : "primary"}
        >
          {PREGNANCY_ANC_COPY.progressFormat(summary.completed, summary.target)}
        </Badge>
      </section>

      <ul className="grid gap-3 md:grid-cols-2">
        {ANC_TARGET_SLOTS.map((slot, index) => {
          const status = summary.slots[index];
          if (!status) return null;
          return (
            <li
              key={slot.visitNumber}
              className="space-y-3 rounded-lg border border-border bg-surface p-4"
            >
              <header className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {PREGNANCY_ANC_COPY.visitNumberFormat(slot.visitNumber)}
                  </p>
                  {status.recorded ? (
                    <Badge tone="success">{status.eventDate}</Badge>
                  ) : (
                    <Badge tone="neutral">Belum</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {PREGNANCY_ANC_COPY.weekRangeFormat(
                    slot.minWeek,
                    slot.maxWeek,
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {slot.description}
                </p>
                {slot.recommendedByDoctor ? (
                  <Badge tone="primary">
                    {PREGNANCY_ANC_COPY.recommendedDoctorLabel}
                  </Badge>
                ) : null}
              </header>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={status.recorded ? "secondary" : "primary"}
                  disabled={pending}
                  onClick={() =>
                    submitRecord(
                      slot.visitNumber,
                      slot.recommendedByDoctor,
                      slot.recommendUsg,
                    )
                  }
                >
                  {recordPending
                    ? PREGNANCY_ANC_COPY.saving
                    : PREGNANCY_ANC_COPY.markCta}
                </Button>
                {status.recorded && status.eventDate ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => submitDelete(status.eventDate as string)}
                  >
                    {PREGNANCY_ANC_COPY.removeCta}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
