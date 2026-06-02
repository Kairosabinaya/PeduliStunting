import type { TrackerGrowthIndicatorStatus } from "@/application/tracking/tracker-dashboard-view-model";
import { Badge } from "@/components/primitives/badge";
import {
  GROWTH_INDICATOR_PARENT_LABEL,
  SD_CLASS_DISPLAY,
  TRACKER_DASHBOARD_COPY,
} from "@/config/tracker";

export interface GrowthStatusTileProps {
  readonly status: TrackerGrowthIndicatorStatus;
  /**
   * The single most recent measurement date for the child. When this tile's
   * value comes from an older measurement (each indicator independently uses
   * its latest *valid* reading), the tile surfaces its own date so the value is
   * never silently attributed to the header's "last measured" date.
   */
  readonly latestMeasuredAt: string | null;
}

/**
 * One growth indicator tile in the `/tracker` status overview. Shows the
 * indicator label, the latest valid measurement value, its z-score, the SD
 * classification badge, and — only when it differs from the overall latest
 * measurement — the date that value was taken.
 *
 * @example
 * ```tsx
 * <GrowthStatusTile status={status} latestMeasuredAt={latest.measuredAt} />
 * ```
 */
export function GrowthStatusTile({
  status,
  latestMeasuredAt,
}: GrowthStatusTileProps) {
  const display = SD_CLASS_DISPLAY[status.sdClass];
  const showOwnDate =
    latestMeasuredAt !== null && status.measuredAt !== latestMeasuredAt;

  return (
    <li className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {GROWTH_INDICATOR_PARENT_LABEL[status.indicator]}
        </p>
        <Badge tone={display.tone}>{display.label}</Badge>
      </div>
      <p className="mt-3 text-lg font-semibold text-foreground">
        {formatIndicatorValue(status)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {TRACKER_DASHBOARD_COPY.fields.zScore} {formatSigned(status.zScore)}
      </p>
      {showOwnDate ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {TRACKER_DASHBOARD_COPY.status.tileMeasuredAt(
            formatMeasuredAt(status.measuredAt),
          )}
        </p>
      ) : null}
    </li>
  );
}

function formatMeasuredAt(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

function formatMeasurement(
  value: number | null,
  unit: "kilogram" | "centimeter",
): string {
  return value === null
    ? TRACKER_DASHBOARD_COPY.status.noValue
    : `${value} ${TRACKER_DASHBOARD_COPY.units[unit]}`;
}

function formatIndicatorValue(status: TrackerGrowthIndicatorStatus): string {
  switch (status.indicator) {
    case "BB_U":
      return formatMeasurement(status.weightKg, "kilogram");
    case "TB_U":
      return formatMeasurement(status.heightCm, "centimeter");
    case "BB_TB":
      return `${formatMeasurement(status.weightKg, "kilogram")} / ${formatMeasurement(status.heightCm, "centimeter")}`;
    case "LK_U":
      return formatMeasurement(status.headCircumferenceCm, "centimeter");
  }
}
