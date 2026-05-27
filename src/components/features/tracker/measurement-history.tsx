import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import { Badge } from "@/components/primitives/badge";
import { EmptyState } from "@/components/primitives/empty-state";
import { GROWTH_INDICATOR_SHORT, MEASUREMENTS_COPY } from "@/config/tracker";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

import { SdClassBadge } from "./sd-class-badge";

export interface MeasurementHistoryProps {
  readonly measurements: readonly GrowthMeasurementDto[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatNumber(value: number | null, unit: string): string {
  if (value === null) return "-";
  return `${value} ${unit}`;
}

function sortedByDateDesc(
  rows: readonly GrowthMeasurementDto[],
): readonly GrowthMeasurementDto[] {
  return [...rows].sort((a, b) =>
    a.measuredAt < b.measuredAt ? 1 : a.measuredAt > b.measuredAt ? -1 : 0,
  );
}

interface IndicatorChip {
  readonly indicator: GrowthIndicator;
  readonly zScore: number;
  readonly sdClass: SdClass;
}

function indicatorsFor(
  measurement: GrowthMeasurementDto,
): readonly IndicatorChip[] {
  const chips: IndicatorChip[] = [];
  for (const indicator of GROWTH_INDICATORS) {
    const z = measurement.zScores[indicator];
    const cls = measurement.sdClass[indicator];
    if (typeof z !== "number" || typeof cls !== "string") continue;
    chips.push({ indicator, zScore: z, sdClass: cls as SdClass });
  }
  return chips;
}

/**
 * Reverse-chronological list of growth measurements with per-indicator SD
 * class badges. Each row also surfaces the raw values so caregivers can spot
 * data-entry errors quickly.
 */
export function MeasurementHistory({ measurements }: MeasurementHistoryProps) {
  if (measurements.length === 0) {
    return (
      <EmptyState
        title={MEASUREMENTS_COPY.emptyTitle}
        description={MEASUREMENTS_COPY.emptyDescription}
      />
    );
  }

  const rows = sortedByDateDesc(measurements);

  return (
    <ol className="space-y-3">
      {rows.map((row) => {
        const chips = indicatorsFor(row);
        return (
          <li
            key={row.id}
            className="space-y-3 rounded-xl border border-border bg-surface p-4 md:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {formatDate(row.measuredAt)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <SdClassBadge key={chip.indicator} sdClass={chip.sdClass} />
                ))}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs text-muted-foreground md:grid-cols-4">
              <div>
                <dt>BB</dt>
                <dd className="text-foreground">
                  {formatNumber(row.weightKg, "kg")}
                </dd>
              </div>
              <div>
                <dt>TB/PB</dt>
                <dd className="text-foreground">
                  {formatNumber(row.heightCm, "cm")}
                </dd>
              </div>
              <div>
                <dt>LK</dt>
                <dd className="text-foreground">
                  {formatNumber(row.headCircumferenceCm, "cm")}
                </dd>
              </div>
              <div>
                <dt>LiLA</dt>
                <dd className="text-foreground">
                  {formatNumber(row.muacCm, "cm")}
                </dd>
              </div>
            </dl>
            {chips.length > 0 ? (
              <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {chips.map((chip) => (
                  <li key={chip.indicator} className="flex items-center gap-1">
                    <Badge tone="neutral">
                      {GROWTH_INDICATOR_SHORT[chip.indicator]}
                    </Badge>
                    <span>z = {chip.zScore.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {row.note ? (
              <p className="text-sm text-muted-foreground">{row.note}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
