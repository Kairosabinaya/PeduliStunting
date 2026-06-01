"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";
import {
  CHILD_DETAIL_COPY,
  GROWTH_INDICATOR_PARENT_LABEL,
  SD_CLASS_DISPLAY,
  TRACKER_DASHBOARD_COPY,
} from "@/config/tracker";
import { asDateOnly } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import {
  SD_CLASSES,
  type SdClass,
} from "@/domain/tracking/value-objects/sd-classification";

export interface GrowthChartProps {
  readonly child: ChildDto;
  readonly measurements: readonly GrowthMeasurementDto[];
  readonly indicator: GrowthIndicator;
  /**
   * Called when the user activates (click/keyboard) a measurement dot. The
   * parent card opens a bottom sheet using this measurement. Optional so the
   * chart can be embedded read-only in the future.
   */
  readonly onSelectMeasurement?: (measurement: GrowthMeasurementDto) => void;
}

interface ChartPoint {
  readonly ageMonths: number;
  readonly zScore: number;
  readonly measuredAt: string;
  readonly measurement: GrowthMeasurementDto;
}

const Y_TICKS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

const CHART_HEIGHT_CLASS = "h-72 w-full md:h-96";

function buildPoints(
  child: ChildDto,
  measurements: readonly GrowthMeasurementDto[],
  indicator: GrowthIndicator,
): readonly ChartPoint[] {
  const birth = asDateOnly(child.birthDate);
  const points: ChartPoint[] = [];
  for (const m of measurements) {
    const z = m.zScores[indicator];
    if (typeof z !== "number" || !Number.isFinite(z)) continue;
    const age = monthsBetween(birth, asDateOnly(m.measuredAt));
    points.push({
      ageMonths: age,
      zScore: Number(z.toFixed(3)),
      measuredAt: m.measuredAt,
      measurement: m,
    });
  }
  return points.sort((a, b) => a.ageMonths - b.ageMonths);
}

/**
 * Z-score growth curve plotted against the WHO ±2/±3 SD reference lines.
 * Phase 2 enhancements:
 *
 *   - Three coloured zones via `<ReferenceArea>` (normal -2..+2, warning
 *     -3..-2 and +2..+3, danger di luar ±3).
 *   - Named horizontal reference lines for median + ambang stunting.
 *   - Click handler on dots: parent receives the underlying measurement so
 *     a detail sheet can open.
 *
 * Pure presentational Client Component — Recharts must run on the client
 * because it measures DOM nodes. Indicator selection lives in the parent.
 */
export function GrowthChart({
  child,
  measurements,
  indicator,
  onSelectMeasurement,
}: GrowthChartProps) {
  const data = useMemo(
    () => buildPoints(child, measurements, indicator),
    [child, measurements, indicator],
  );

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
        {CHILD_DETAIL_COPY.chartEmpty}
      </p>
    );
  }

  return (
    <div
      role="img"
      aria-label={CHILD_DETAIL_COPY.chartAriaLabel(
        GROWTH_INDICATOR_PARENT_LABEL[indicator],
      )}
      className={CHART_HEIGHT_CLASS}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...data]}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--color-border))"
          />
          <XAxis
            type="number"
            dataKey="ageMonths"
            label={{
              value: CHILD_DETAIL_COPY.chartAgeAxisLabel,
              position: "insideBottom",
              offset: -4,
              fill: "rgb(var(--color-muted-foreground))",
            }}
            stroke="rgb(var(--color-muted-foreground))"
            allowDecimals={false}
          />
          <YAxis
            type="number"
            dataKey="zScore"
            domain={[-4, 4]}
            ticks={Y_TICKS}
            label={{
              value: TRACKER_DASHBOARD_COPY.fields.zScore,
              angle: -90,
              position: "insideLeft",
              fill: "rgb(var(--color-muted-foreground))",
            }}
            stroke="rgb(var(--color-muted-foreground))"
          />
          <Tooltip
            formatter={(value, _name, item) => {
              const payload = readChartPoint(item);
              if (typeof value !== "number" || payload === null) {
                return ["-", TRACKER_DASHBOARD_COPY.fields.status];
              }
              const sd = readSdClass(payload.measurement.sdClass[indicator]);
              const display = sd
                ? SD_CLASS_DISPLAY[sd].label
                : SD_CLASS_DISPLAY.normal.label;
              return [
                `${display} (${TRACKER_DASHBOARD_COPY.fields.zScore}: ${formatSigned(value)})`,
                TRACKER_DASHBOARD_COPY.fields.nutritionStatus,
              ];
            }}
            labelFormatter={(value) =>
              typeof value === "number"
                ? `${TRACKER_DASHBOARD_COPY.fields.age}: ${value} ${TRACKER_DASHBOARD_COPY.units.month}`
                : ""
            }
            contentStyle={{
              background: "rgb(var(--color-surface))",
              borderRadius: 8,
              border: "1px solid rgb(var(--color-border))",
              fontSize: 12,
            }}
          />
          <ReferenceArea
            y1={-2}
            y2={2}
            fill="rgb(var(--color-ordinal-rendah))"
            fillOpacity={0.08}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={2}
            y2={3}
            fill="rgb(var(--color-ordinal-sedang))"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={-3}
            y2={-2}
            fill="rgb(var(--color-ordinal-sedang))"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={3}
            y2={4}
            fill="rgb(var(--color-ordinal-tinggi))"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={-4}
            y2={-3}
            fill="rgb(var(--color-ordinal-tinggi))"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceLine
            y={3}
            stroke="rgb(var(--color-danger))"
            strokeDasharray="4 4"
          />
          <ReferenceLine
            y={2}
            stroke="rgb(var(--color-ordinal-sedang))"
            strokeDasharray="4 4"
            label={{
              value: CHILD_DETAIL_COPY.chartUpperNormalBoundary,
              position: "insideTopRight",
              fill: "rgb(var(--color-ordinal-sedang))",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={0}
            stroke="rgb(var(--color-muted-foreground))"
            label={{
              value: CHILD_DETAIL_COPY.chartWhoMedian,
              position: "insideTopRight",
              fill: "rgb(var(--color-muted-foreground))",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={-2}
            stroke="rgb(var(--color-ordinal-sedang))"
            strokeDasharray="4 4"
            label={{
              value:
                indicator === "TB_U"
                  ? CHILD_DETAIL_COPY.chartStuntingBoundary
                  : CHILD_DETAIL_COPY.chartLowerNormalBoundary,
              position: "insideBottomRight",
              fill: "rgb(var(--color-ordinal-sedang))",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={-3}
            stroke="rgb(var(--color-danger))"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="zScore"
            stroke="rgb(var(--color-primary))"
            strokeWidth={2}
            dot={(props) => (
              <ClickableDot {...props} onSelect={onSelectMeasurement} />
            )}
            activeDot={{ r: 7 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ClickableDotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: ChartPoint;
  readonly onSelect?: ((m: GrowthMeasurementDto) => void) | undefined;
  readonly index?: number;
}

function ClickableDot(props: ClickableDotProps) {
  const { cx, cy, payload, onSelect, index } = props;
  if (cx === undefined || cy === undefined || !payload) {
    return <g key={`dot-empty-${index ?? "x"}`} />;
  }
  return (
    <g key={`dot-${payload.measuredAt}`}>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="rgb(var(--color-primary))"
        stroke="rgb(var(--color-surface))"
        strokeWidth={2}
        className={onSelect ? "cursor-pointer" : "cursor-default"}
        onClick={() => onSelect?.(payload.measurement)}
      />
    </g>
  );
}

export default GrowthChart;

function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

function isChartPoint(value: unknown): value is ChartPoint {
  if (value === null || typeof value !== "object") return false;
  if (!("ageMonths" in value) || !("zScore" in value)) return false;
  if (!("measuredAt" in value) || !("measurement" in value)) return false;
  const candidate = value as {
    readonly ageMonths?: unknown;
    readonly zScore?: unknown;
    readonly measuredAt?: unknown;
    readonly measurement?: unknown;
  };
  return (
    typeof candidate.ageMonths === "number" &&
    typeof candidate.zScore === "number" &&
    typeof candidate.measuredAt === "string" &&
    candidate.measurement !== null &&
    typeof candidate.measurement === "object"
  );
}

function readChartPoint(item: unknown): ChartPoint | null {
  if (item === null || typeof item !== "object" || !("payload" in item)) {
    return null;
  }
  const payload = (item as { readonly payload?: unknown }).payload;
  return isChartPoint(payload) ? payload : null;
}

function readSdClass(value: string | undefined): SdClass | null {
  if (value === undefined) return null;
  if ((SD_CLASSES as readonly string[]).includes(value)) {
    return value as SdClass;
  }
  return null;
}
