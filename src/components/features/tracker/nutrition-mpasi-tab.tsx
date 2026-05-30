"use client";

import { useActionState, useId, useState, useTransition } from "react";

import { recordNutritionEvent } from "@/app/(app)/tracker/anak/[childId]/gizi/actions";
import {
  INITIAL_NUTRITION_FORM_STATE,
  type NutritionFormState,
} from "@/app/(app)/tracker/anak/[childId]/gizi/_lib/nutrition-form-state";
import type { NutritionEventDto } from "@/application/health-plan/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { MPASI_FOOD_GROUPS, MPASI_TEXTURE_GUIDES } from "@/config/nutrition";
import { NUTRITION_MPASI_COPY } from "@/config/tracker";
import { readMpasiStatus } from "@/domain/health-plan/services/nutrition-status";

export interface NutritionMpasiTabProps {
  readonly childId: string;
  readonly childAgeMonths: number;
  readonly events: readonly NutritionEventDto[];
}

const MPASI_MIN_AGE_MONTHS = 6;

export function NutritionMpasiTab({
  childId,
  childAgeMonths,
  events,
}: NutritionMpasiTabProps) {
  const boundAction = recordNutritionEvent.bind(null, childId);
  const [state, action, pending] = useActionState<
    NutritionFormState | null,
    FormData
  >(boundAction, INITIAL_NUTRITION_FORM_STATE);
  const [, startTransition] = useTransition();

  const status = readMpasiStatus(
    state?.ok && state.record
      ? [state.record, ...events.filter((e) => e.id !== state.record?.id)]
      : events,
  );

  const [startedAt, setStartedAt] = useState<string>(status.startedAt ?? "");
  const dateId = useId();

  function submit() {
    if (!startedAt) return;
    const form = new FormData();
    form.set("kind", "mpasi_started");
    form.set("eventDate", startedAt);
    form.set("data", "{}");
    form.set("note", "");
    startTransition(() => {
      action(form);
    });
  }

  const underAge = childAgeMonths < MPASI_MIN_AGE_MONTHS;

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {NUTRITION_MPASI_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {NUTRITION_MPASI_COPY.description}
        </p>
      </section>

      {underAge ? (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-xs text-foreground">
          {NUTRITION_MPASI_COPY.outOfAgeMessage}
        </p>
      ) : null}

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <div className="space-y-1">
          <Label htmlFor={dateId}>
            {NUTRITION_MPASI_COPY.startedAtQuestion}
          </Label>
          <Input
            id={dateId}
            type="date"
            value={startedAt}
            max={todayIso()}
            onChange={(event) => setStartedAt(event.target.value)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={pending || !startedAt}
          loading={pending}
        >
          {pending ? NUTRITION_MPASI_COPY.saving : NUTRITION_MPASI_COPY.saveCta}
        </Button>
        {status.startedAt ? (
          <p className="text-xs text-muted-foreground">
            {NUTRITION_MPASI_COPY.startedAtSavedFormat(status.startedAt)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {NUTRITION_MPASI_COPY.startedAtNotYet}
          </p>
        )}
        {state && !state.ok && state.message ? (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
          >
            {state.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <header className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {NUTRITION_MPASI_COPY.foodGroupsHeading}
          </p>
          <p className="text-xs text-muted-foreground">
            {NUTRITION_MPASI_COPY.foodGroupsSubtitle}
          </p>
        </header>
        <ul className="grid gap-2 sm:grid-cols-2">
          {MPASI_FOOD_GROUPS.map((group) => (
            <li
              key={group.id}
              className="space-y-1 rounded-md border border-border bg-surface-muted/40 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {group.title}
                </span>
                {group.emphasis ? (
                  <Badge tone="primary">
                    {NUTRITION_MPASI_COPY.emphasisBadge}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{group.examples}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <header className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {NUTRITION_MPASI_COPY.textureHeading}
          </p>
          <p className="text-xs text-muted-foreground">
            {NUTRITION_MPASI_COPY.textureSubtitle}
          </p>
        </header>
        <ol className="space-y-2">
          {MPASI_TEXTURE_GUIDES.map((guide) => (
            <li
              key={guide.id}
              className="rounded-md border border-border bg-surface-muted/30 p-3 text-xs"
            >
              <p className="font-semibold text-foreground">{guide.ageLabel}</p>
              <p className="text-muted-foreground">{guide.texture}</p>
              <p className="text-muted-foreground">Porsi: {guide.portion}</p>
              <p className="text-muted-foreground">
                Frekuensi: {guide.frequency}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
