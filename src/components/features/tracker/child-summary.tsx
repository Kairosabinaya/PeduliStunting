import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { CHILD_DETAIL_COPY, GROWTH_INDICATOR_LABEL } from "@/config/tracker";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

import { SdClassBadge } from "./sd-class-badge";

export interface ChildSummaryProps {
  readonly measurements: readonly GrowthMeasurementDto[];
}

interface IndicatorSummary {
  readonly indicator: GrowthIndicator;
  readonly measurement: GrowthMeasurementDto;
  readonly zScore: number;
  readonly sdClass: SdClass;
}

function buildSummaries(
  measurements: readonly GrowthMeasurementDto[],
): readonly IndicatorSummary[] {
  const sorted = [...measurements].sort((a, b) =>
    a.measuredAt < b.measuredAt ? 1 : a.measuredAt > b.measuredAt ? -1 : 0,
  );
  const summaries: IndicatorSummary[] = [];
  for (const indicator of GROWTH_INDICATORS) {
    const found = sorted.find((m) => {
      const z = m.zScores[indicator];
      const cls = m.sdClass[indicator];
      return typeof z === "number" && typeof cls === "string";
    });
    if (!found) continue;
    const zScore = found.zScores[indicator] as number;
    const sdClass = found.sdClass[indicator] as SdClass;
    summaries.push({
      indicator,
      measurement: found,
      zScore,
      sdClass,
    });
  }
  return summaries;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Latest measurement per indicator with SD-class badge. Pulls the most recent
 * row that has a finite z-score for the given indicator — measurements that
 * skipped a field (e.g. did not record head circumference) do not blank out
 * the summary tile for that indicator.
 */
export function ChildSummary({ measurements }: ChildSummaryProps) {
  const summaries = buildSummaries(measurements);

  return (
    <Card elevation="sm" padding="md" className="flex h-full flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">
          {CHILD_DETAIL_COPY.summaryCardTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {CHILD_DETAIL_COPY.summaryCardDescription}
        </p>
      </header>
      {summaries.length === 0 ? (
        <EmptyState
          title={CHILD_DETAIL_COPY.noMeasurementYet}
          description={CHILD_DETAIL_COPY.chartEmpty}
        />
      ) : (
        <ul className="space-y-2">
          {summaries.map((summary) => (
            <li
              key={summary.indicator}
              className="rounded-lg border border-border bg-surface-muted p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {GROWTH_INDICATOR_LABEL[summary.indicator]}
                </span>
                <SdClassBadge sdClass={summary.sdClass} />
              </div>
              <p className="mt-1 flex items-baseline gap-1.5 text-xs text-muted-foreground">
                <span className="sr-only">Z-score</span>
                <span className="font-mono tabular-nums text-foreground">
                  {summary.zScore.toFixed(2)}
                </span>
                <span aria-hidden>·</span>
                <span>
                  <span className="sr-only">Diukur </span>
                  {formatDate(summary.measurement.measuredAt)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
