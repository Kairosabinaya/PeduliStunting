"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import {
  CHILD_DETAIL_COPY,
  GROWTH_INDICATOR_LABEL,
  GROWTH_INDICATOR_SHORT,
} from "@/config/tracker";
import { asDateOnly } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";

export interface GrowthChartProps {
  readonly child: ChildDto;
  readonly measurements: readonly GrowthMeasurementDto[];
}

interface ChartPoint {
  readonly ageMonths: number;
  readonly zScore: number;
  readonly measuredAt: string;
}

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
    });
  }
  return points.sort((a, b) => a.ageMonths - b.ageMonths);
}

const Y_TICKS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

/**
 * Z-score growth curve plotted against the WHO ±2/±3 SD reference lines. Pure
 * presentational Client Component — the parent decides which indicator is
 * visible by default and supplies the measurements. Recharts must run on the
 * client because it measures DOM nodes to draw the SVG.
 */
export function GrowthChart({ child, measurements }: GrowthChartProps) {
  const [indicator, setIndicator] = useState<GrowthIndicator>("BB_U");

  const data = useMemo(
    () => buildPoints(child, measurements, indicator),
    [child, measurements, indicator],
  );

  const isEmpty = data.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="growth-chart-indicator">
            {CHILD_DETAIL_COPY.chartIndicatorLabel}
          </Label>
          <Select
            id="growth-chart-indicator"
            value={indicator}
            onChange={(e) => setIndicator(e.target.value as GrowthIndicator)}
            className="min-w-56"
          >
            {GROWTH_INDICATORS.map((value) => (
              <option key={value} value={value}>
                {GROWTH_INDICATOR_SHORT[value]} —{" "}
                {GROWTH_INDICATOR_LABEL[value]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isEmpty ? (
        <p className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
          {CHILD_DETAIL_COPY.chartEmpty}
        </p>
      ) : (
        <div
          role="img"
          aria-label={`Kurva ${GROWTH_INDICATOR_SHORT[indicator]} terhadap usia (bulan)`}
          className="h-72 w-full md:h-96"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...data]}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
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
              <ReferenceLine
                y={3}
                stroke="var(--color-danger)"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                y={2}
                stroke="var(--color-ordinal-sedang)"
                strokeDasharray="4 4"
              />
              <ReferenceLine y={0} stroke="var(--color-muted-foreground)" />
              <ReferenceLine
                y={-2}
                stroke="var(--color-ordinal-sedang)"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                y={-3}
                stroke="var(--color-danger)"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="zScore"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--color-primary)" }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default GrowthChart;
