"use client";

import { useActionState, useTransition } from "react";

import { recordNutritionEvent } from "@/app/(app)/tracker/anak/[childId]/gizi/actions";
import {
  INITIAL_NUTRITION_FORM_STATE,
  type NutritionFormState,
} from "@/app/(app)/tracker/anak/[childId]/gizi/_lib/nutrition-form-state";
import type { NutritionEventDto } from "@/application/health-plan/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { NUTRITION_ASI_COPY } from "@/config/tracker";
import { readAsiExclusiveStatus } from "@/domain/health-plan/services/nutrition-status";
import { todayIso } from "@/lib/today";

export interface NutritionAsiTabProps {
  readonly childId: string;
  readonly childAgeMonths: number;
  readonly events: readonly NutritionEventDto[];
}

const ASI_TARGET_AGE_MONTHS = 6;

export function NutritionAsiTab({
  childId,
  childAgeMonths,
  events,
}: NutritionAsiTabProps) {
  const boundAction = recordNutritionEvent.bind(null, childId);
  const [state, action, pending] = useActionState<
    NutritionFormState | null,
    FormData
  >(boundAction, INITIAL_NUTRITION_FORM_STATE);
  const [, startTransition] = useTransition();

  const status = readAsiExclusiveStatus(
    state?.ok && state.record
      ? [state.record, ...events.filter((e) => e.id !== state.record?.id)]
      : events,
  );

  function submit(exclusive: boolean) {
    const form = new FormData();
    form.set("kind", "asi_exclusive");
    form.set("eventDate", todayIso());
    form.set("data", JSON.stringify({ exclusive }));
    form.set("note", "");
    startTransition(() => {
      action(form);
    });
  }

  const isOverAge = childAgeMonths > ASI_TARGET_AGE_MONTHS;

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {NUTRITION_ASI_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {NUTRITION_ASI_COPY.description}
        </p>
      </section>

      {isOverAge ? (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-xs text-foreground">
          {NUTRITION_ASI_COPY.outOfAgeMessage}
        </p>
      ) : null}

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">
          {NUTRITION_ASI_COPY.question}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={status.exclusive === true ? "primary" : "outline"}
            size="sm"
            onClick={() => submit(true)}
            disabled={pending}
          >
            {pending ? NUTRITION_ASI_COPY.saving : NUTRITION_ASI_COPY.optionYes}
          </Button>
          <Button
            type="button"
            variant={status.exclusive === false ? "primary" : "outline"}
            size="sm"
            onClick={() => submit(false)}
            disabled={pending}
          >
            {NUTRITION_ASI_COPY.optionNo}
          </Button>
        </div>
        <StatusLine status={status} />
        {state && !state.ok && state.message ? (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
          >
            {state.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-1 rounded-lg border border-accent/30 bg-accent/10 p-4">
        <p className="text-sm font-semibold text-foreground">
          {NUTRITION_ASI_COPY.educationHeading}
        </p>
        <p className="text-sm text-muted-foreground">
          {NUTRITION_ASI_COPY.educationBody}
        </p>
      </section>
    </div>
  );
}

function StatusLine({
  status,
}: {
  readonly status: ReturnType<typeof readAsiExclusiveStatus>;
}) {
  if (!status.latest) {
    return (
      <p className="text-xs text-muted-foreground">
        {NUTRITION_ASI_COPY.notRecorded}
      </p>
    );
  }
  const prefix =
    status.exclusive === true
      ? NUTRITION_ASI_COPY.currentStatusYes
      : NUTRITION_ASI_COPY.currentStatusNo;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge tone={status.exclusive ? "success" : "warning"}>
        {status.exclusive
          ? NUTRITION_ASI_COPY.optionYes
          : NUTRITION_ASI_COPY.optionNo}
      </Badge>
      <span>
        {prefix} {status.latest.eventDate}.
      </span>
    </div>
  );
}
