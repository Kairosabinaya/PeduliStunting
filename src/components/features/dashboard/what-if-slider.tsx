"use client";

import { useMemo, useState } from "react";

import type { CoefficientSummaryItemDto } from "@/application/model/dtos";
import { Badge } from "@/components/primitives/badge";
import { Select } from "@/components/primitives/select";
import { Slider } from "@/components/primitives/slider";
import {
  DASHBOARD_WHATIF_DELTA,
  DASHBOARD_WHATIF_SECTION,
} from "@/config/dashboard";

interface WhatIfPredictorChoice {
  readonly code: string;
  readonly label: string;
  readonly summary: CoefficientSummaryItemDto;
  readonly unit: string | null;
}

export interface WhatIfSliderProps {
  readonly choices: readonly WhatIfPredictorChoice[];
}

const DELTA_TICKS = [
  { value: DASHBOARD_WHATIF_DELTA.min, label: DASHBOARD_WHATIF_DELTA.min.toString() },
  { value: 0, label: "0" },
  { value: DASHBOARD_WHATIF_DELTA.max, label: `+${DASHBOARD_WHATIF_DELTA.max}` },
];

export function WhatIfSlider({ choices }: WhatIfSliderProps) {
  const firstCode = choices[0]?.code ?? "";
  const [selectedCode, setSelectedCode] = useState<string>(firstCode);
  const [delta, setDelta] = useState<number>(DASHBOARD_WHATIF_DELTA.default);

  const selected = useMemo(
    () => choices.find((choice) => choice.code === selectedCode) ?? choices[0],
    [choices, selectedCode],
  );

  if (!selected) return null;

  const shift = selected.summary.meanCoefficient * delta;
  const shiftSign = shift > 0 ? "+" : "";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">
            {DASHBOARD_WHATIF_SECTION.selectPredictorLabel}
          </span>
          <Select
            value={selected.code}
            onChange={(event) => setSelectedCode(event.target.value)}
          >
            {choices.map((choice) => (
              <option key={choice.code} value={choice.code}>
                {choice.code} — {choice.label}
              </option>
            ))}
          </Select>
        </label>
        <div className="flex items-end">
          <Badge
            tone={selected.summary.hasInference ? "primary" : "neutral"}
            aria-label={
              selected.summary.hasInference
                ? DASHBOARD_WHATIF_SECTION.inferenceBadge
                : DASHBOARD_WHATIF_SECTION.observedBadge
            }
          >
            {selected.summary.hasInference
              ? DASHBOARD_WHATIF_SECTION.inferenceBadge
              : DASHBOARD_WHATIF_SECTION.observedBadge}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {DASHBOARD_WHATIF_SECTION.deltaLabel}
          {selected.unit ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({selected.unit})
            </span>
          ) : null}
        </p>
        <Slider
          value={delta}
          min={DASHBOARD_WHATIF_DELTA.min}
          max={DASHBOARD_WHATIF_DELTA.max}
          step={DASHBOARD_WHATIF_DELTA.step}
          onChange={setDelta}
          ticks={DELTA_TICKS}
          formatValue={(value) => value.toFixed(1)}
          hint={DASHBOARD_WHATIF_SECTION.deltaHint}
          ariaLabel={DASHBOARD_WHATIF_SECTION.deltaLabel}
        />
      </div>

      <dl className="grid gap-3 rounded-lg border border-border bg-surface-muted/40 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {DASHBOARD_WHATIF_SECTION.estimatedShiftLabel}
          </dt>
          <dd className="mt-1 font-mono text-2xl tabular-nums text-foreground">
            {shiftSign}
            {shift.toFixed(3)}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            {DASHBOARD_WHATIF_SECTION.estimatedShiftHint}
          </p>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {DASHBOARD_WHATIF_SECTION.contributingRegionsLabel}
          </dt>
          <dd className="mt-1 font-mono text-2xl tabular-nums text-foreground">
            {selected.summary.contributingRegions}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            {DASHBOARD_WHATIF_SECTION.formulaCaption}
          </p>
        </div>
      </dl>
    </div>
  );
}
