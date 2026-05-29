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
import { CHILD_DETAIL_COPY, GROWTH_INDICATOR_SHORT } from "@/config/tracker";
import { asDateOnly } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";

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
      aria-label={`Kurva ${GROWTH_INDICATOR_SHORT[indicator]} terhadap usia (bulan)`}
      className={CHART_HEIGHT_CLASS}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...data]}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            type="number"
            dataKey="ageMonths"
            label={{
              value: "Usia (bulan)",
              position: "insideBottom",
              offset: -4,
              fill: "var(--color-muted-foreground)",
            }}
            stroke="var(--color-muted-foreground)"
            allowDecimals={false}
          />
          <YAxis
            type="number"
            dataKey="zScore"
            domain={[-4, 4]}
            ticks={Y_TICKS}
            label={{
              value: "Z-score",
              angle: -90,
              position: "insideLeft",
              fill: "var(--color-muted-foreground)",
            }}
            stroke="var(--color-muted-foreground)"
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? [value.toFixed(2), "Z-score"]
                : ["-", "Z-score"]
            }
            labelFormatter={(value) =>
              typeof value === "number" ? `Usia: ${value} bulan` : ""
            }
            contentStyle={{
              background: "var(--color-surface)",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontSize: 12,
            }}
          />
          <ReferenceArea
            y1={-2}
            y2={2}
            fill="var(--color-ordinal-rendah)"
            fillOpacity={0.08}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={2}
            y2={3}
            fill="var(--color-ordinal-sedang)"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={-3}
            y2={-2}
            fill="var(--color-ordinal-sedang)"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={3}
            y2={4}
            fill="var(--color-ordinal-tinggi)"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={-4}
            y2={-3}
            fill="var(--color-ordinal-tinggi)"
            fillOpacity={0.1}
            ifOverflow="visible"
          />
          <ReferenceLine
            y={3}
            stroke="var(--color-danger)"
            strokeDasharray="4 4"
            label={{
              value: "+3 SD",
              position: "insideTopRight",
              fill: "var(--color-danger)",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={2}
            stroke="var(--color-ordinal-sedang)"
            strokeDasharray="4 4"
            label={{
              value: "+2 SD",
              position: "insideTopRight",
              fill: "var(--color-ordinal-sedang)",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={0}
            stroke="var(--color-muted-foreground)"
            label={{
              value: "Median WHO",
              position: "insideTopRight",
              fill: "var(--color-muted-foreground)",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={-2}
            stroke="var(--color-ordinal-sedang)"
            strokeDasharray="4 4"
            label={{
              value: indicator === "TB_U" ? "Ambang stunting -2 SD" : "-2 SD",
              position: "insideBottomRight",
              fill: "var(--color-ordinal-sedang)",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={-3}
            stroke="var(--color-danger)"
            strokeDasharray="4 4"
            label={{
              value: "-3 SD",
              position: "insideBottomRight",
              fill: "var(--color-danger)",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="zScore"
            stroke="var(--color-primary)"
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
        fill="var(--color-primary)"
        stroke="var(--color-surface)"
        strokeWidth={2}
        style={{ cursor: onSelect ? "pointer" : "default" }}
        onClick={() => onSelect?.(payload.measurement)}
      />
    </g>
  );
}

export default GrowthChart;
