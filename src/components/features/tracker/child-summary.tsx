import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { CHILD_DETAIL_COPY, GROWTH_INDICATOR_LABEL } from "@/config/tracker";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

import { InfoDialog } from "@/components/primitives/info-dialog";

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

function getMeasurementLabel(
  indicator: GrowthIndicator,
  measurement: GrowthMeasurementDto,
): string {
  switch (indicator) {
    case "BB_U":
      return measurement.weightKg ? `${measurement.weightKg} kg` : "-";
    case "TB_U":
      return measurement.heightCm ? `${measurement.heightCm} cm` : "-";
    case "BB_TB":
      if (measurement.weightKg && measurement.heightCm)
        return `${measurement.weightKg} kg, ${measurement.heightCm} cm`;
      return "-";
    case "LK_U":
      return measurement.headCircumferenceCm
        ? `${measurement.headCircumferenceCm} cm`
        : "-";
    default:
      return "-";
  }
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
    <Card
      elevation="sm"
      padding="md"
      className="flex h-full flex-col gap-3 transition-all hover:shadow-md"
    >
      <header className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          {CHILD_DETAIL_COPY.summaryCardTitle}
        </h2>
        <InfoDialog
          title={CHILD_DETAIL_COPY.summaryCardTitle}
          description={CHILD_DETAIL_COPY.summaryCardDescription}
        />
      </header>
      {summaries.length === 0 ? (
        <EmptyState
          title={CHILD_DETAIL_COPY.noMeasurementYet}
          description={CHILD_DETAIL_COPY.chartEmpty}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaries.map((summary) => (
            <li
              key={summary.indicator}
              className="flex flex-col justify-between rounded-lg border border-border bg-surface-muted p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {GROWTH_INDICATOR_LABEL[summary.indicator]}
                </span>
                <SdClassBadge sdClass={summary.sdClass} />
              </div>
              <p className="mt-2 flex items-baseline gap-1.5 text-sm text-foreground">
                <span className="text-lg font-semibold">
                  {getMeasurementLabel(summary.indicator, summary.measurement)}
                </span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span className="sr-only">Diukur </span>
                {formatDate(summary.measurement.measuredAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
