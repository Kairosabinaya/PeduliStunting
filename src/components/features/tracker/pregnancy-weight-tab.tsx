"use client";

import { useActionState, useId, useState, useTransition } from "react";

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
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { PREGNANCY_WEIGHT_COPY } from "@/config/tracker";
import { buildWeightSummary } from "@/domain/pregnancy/services/pregnancy-status";
import { todayIso } from "@/lib/today";

export interface PregnancyWeightTabProps {
  readonly pregnancyId: string;
  readonly initialWeightKg: number | null;
  readonly heightCm: number | null;
  readonly events: readonly PregnancyEventDto[];
}

export function PregnancyWeightTab({
  pregnancyId,
  initialWeightKg,
  heightCm,
  events,
}: PregnancyWeightTabProps) {
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
  const [inputValue, setInputValue] = useState<string>("");

  const summary = buildWeightSummary(
    recordState?.ok && recordState.record
      ? [
          recordState.record,
          ...events.filter((e) => e.id !== recordState.record?.id),
        ]
      : events,
    initialWeightKg,
    heightCm,
  );

  const inputId = useId();
  const pending = recordPending || deletePending;

  function submitRecord() {
    const parsed = Number.parseFloat(inputValue.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const form = new FormData();
    form.set("kind", "weight_measurement");
    form.set("eventDate", todayIso());
    form.set("data", JSON.stringify({ weight_kg: parsed }));
    form.set("note", "");
    startTransition(() => {
      runRecord(form);
      setInputValue("");
    });
  }

  function submitDelete(eventDate: string) {
    const form = new FormData();
    form.set("kind", "weight_measurement");
    form.set("eventDate", eventDate);
    startTransition(() => runDelete(form));
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {PREGNANCY_WEIGHT_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {PREGNANCY_WEIGHT_COPY.description}
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        {summary.recommendation ? (
          <p className="text-xs text-muted-foreground">
            {summary.recommendation.label} ·{" "}
            {PREGNANCY_WEIGHT_COPY.recommendationFormat(
              summary.recommendation.minGainKg,
              summary.recommendation.maxGainKg,
            )}
          </p>
        ) : (
          <p className="text-xs text-warning">
            {PREGNANCY_WEIGHT_COPY.missingInitial}
          </p>
        )}
        {summary.currentGainKg !== null ? (
          <Badge
            tone={
              summary.recommendation &&
              summary.currentGainKg >= summary.recommendation.minGainKg &&
              summary.currentGainKg <= summary.recommendation.maxGainKg
                ? "success"
                : "primary"
            }
          >
            {PREGNANCY_WEIGHT_COPY.currentGainFormat(summary.currentGainKg)}
          </Badge>
        ) : null}

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor={inputId}>{PREGNANCY_WEIGHT_COPY.inputLabel}</Label>
            <Input
              id={inputId}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="w-32"
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={pending || !inputValue}
            loading={recordPending}
            onClick={submitRecord}
          >
            {recordPending
              ? PREGNANCY_WEIGHT_COPY.saving
              : PREGNANCY_WEIGHT_COPY.addWeightCta}
          </Button>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">
          {PREGNANCY_WEIGHT_COPY.historyHeading}
        </p>
        {summary.entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {PREGNANCY_WEIGHT_COPY.noEntries}
          </p>
        ) : (
          <ul className="space-y-1">
            {summary.entries.map((entry) => (
              <li
                key={entry.eventDate}
                className="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-xs"
              >
                <span className="font-medium">{entry.eventDate}</span>
                <span>{entry.weightKg.toFixed(1)} kg</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => submitDelete(entry.eventDate)}
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
