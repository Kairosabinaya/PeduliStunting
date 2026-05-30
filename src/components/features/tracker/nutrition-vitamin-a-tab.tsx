"use client";

import { useActionState, useTransition } from "react";

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
import { VIT_A_KAPSUL_SPECS, type VitAKapsulSpec } from "@/config/nutrition";
import { NUTRITION_VITAMIN_A_COPY } from "@/config/tracker";
import { latestEventOfKind } from "@/domain/health-plan/services/nutrition-status";
import { todayIso } from "@/lib/today";

export interface NutritionVitaminATabProps {
  readonly childId: string;
  readonly childAgeMonths: number;
  readonly events: readonly NutritionEventDto[];
}

export function NutritionVitaminATab({
  childId,
  childAgeMonths,
  events,
}: NutritionVitaminATabProps) {
  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {NUTRITION_VITAMIN_A_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {NUTRITION_VITAMIN_A_COPY.description}
        </p>
      </section>

      <section className="space-y-1 rounded-lg border border-accent/30 bg-accent/10 p-4">
        <p className="text-sm font-semibold text-foreground">
          {NUTRITION_VITAMIN_A_COPY.educationHeading}
        </p>
        <p className="text-sm text-muted-foreground">
          {NUTRITION_VITAMIN_A_COPY.educationBody}
        </p>
      </section>

      <ul className="grid gap-3 lg:grid-cols-3">
        {VIT_A_KAPSUL_SPECS.map((spec) => (
          <KapsulCard
            key={spec.kind}
            spec={spec}
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        ))}
      </ul>
    </div>
  );
}

function KapsulCard({
  spec,
  childId,
  childAgeMonths,
  events,
}: {
  readonly spec: VitAKapsulSpec;
  readonly childId: string;
  readonly childAgeMonths: number;
  readonly events: readonly NutritionEventDto[];
}) {
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

  const latest =
    recordState?.ok && recordState.record?.kind === spec.kind
      ? recordState.record
      : latestEventOfKind(events, spec.kind);

  const eligibleByAge =
    childAgeMonths >= spec.minAgeMonths && childAgeMonths <= spec.maxAgeMonths;

  function submitRecord() {
    const form = new FormData();
    form.set("kind", spec.kind);
    form.set("eventDate", todayIso());
    form.set("data", "{}");
    form.set("note", "");
    startTransition(() => {
      runRecord(form);
    });
  }

  function submitDelete() {
    if (!latest) return;
    const form = new FormData();
    form.set("kind", spec.kind);
    form.set("eventDate", latest.eventDate);
    startTransition(() => {
      runDelete(form);
    });
  }

  const pending = recordPending || deletePending;

  return (
    <li className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{spec.label}</p>
        <p className="text-xs text-muted-foreground">{spec.description}</p>
      </header>
      {!eligibleByAge ? (
        <p className="text-xs text-muted-foreground">
          {NUTRITION_VITAMIN_A_COPY.ineligibleMessage}
        </p>
      ) : null}
      {latest ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge tone="success">
            {NUTRITION_VITAMIN_A_COPY.alreadyGivenFormat(latest.eventDate)}
          </Badge>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={latest ? "secondary" : "primary"}
          size="sm"
          onClick={submitRecord}
          disabled={pending || !eligibleByAge}
          loading={recordPending}
        >
          {recordPending
            ? NUTRITION_VITAMIN_A_COPY.saving
            : NUTRITION_VITAMIN_A_COPY.recordCta}
        </Button>
        {latest ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={submitDelete}
            disabled={pending}
          >
            {NUTRITION_VITAMIN_A_COPY.resetCta}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
