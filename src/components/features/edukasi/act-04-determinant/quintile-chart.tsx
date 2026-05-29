"use client";

/**
 * Quintile prevalence chart. Brand-ramp palette (Q1 deepest blue ⇢ Q5
 * lightest) so the ordinal mapping reads at a glance — Q1 is the most
 * economically vulnerable group, Q5 the most prosperous, and the depth
 * of color mirrors that vulnerability.
 *
 * When `activeIndex` is supplied (driven from the parent's scroll
 * progress), only that bar paints in full color; the others fade to a
 * muted state. Pass `null` (or omit the prop) for the static "all bars
 * visible" rendering used in the reduced-motion fallback.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { DETERMINANT_COPY } from "@/config/edukasi";
import {
  INCOME_QUINTILES,
  INCOME_QUINTILE_NATIONAL,
  type IncomeQuintilePoint,
} from "@/data/edukasi/determinants";

interface ChartDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly note: string;
}

/**
 * Single-hue sequential brand ramp from Q1 (most vulnerable) to Q5 (most
 * prosperous). Pulled from `--quintile-*` CSS variables which are theme-
 * aware (see `globals.css`): light mode goes brand-700 → brand-200, dark
 * mode is the inverted ladder so the deepest color still reads against
 * the near-black background.
 */
const QUINTILE_COLORS: readonly string[] = [
  "rgb(var(--quintile-1))",
  "rgb(var(--quintile-2))",
  "rgb(var(--quintile-3))",
  "rgb(var(--quintile-4))",
  "rgb(var(--quintile-5))",
];

export interface QuintileChartProps {
  /**
   * Index 0..4 of the currently highlighted quintile. When supplied,
   * non-active bars fade to ~25% opacity so the active quintile reads as
   * the focal point. `null` (or omit) keeps every bar at full opacity.
   */
  readonly activeIndex?: number | null;
}

export function QuintileChart({ activeIndex = null }: QuintileChartProps) {
  const data: ChartDatum[] = INCOME_QUINTILES.map(
    (q: IncomeQuintilePoint): ChartDatum => ({
      id: q.id,
      label: q.label,
      value: q.prevalencePct,
      note: q.note,
    }),
  );

  return (
    <figure
      className="not-prose rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
      aria-label={DETERMINANT_COPY.quintileTitle}
    >
      <header className="mb-3">
        <h3 className="text-lg font-semibold text-foreground">
          {DETERMINANT_COPY.quintileTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {DETERMINANT_COPY.quintileDescription}
        </p>
      </header>
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%" minHeight={288}>
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              stroke="rgb(var(--color-border))"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{
                fill: "rgb(var(--color-muted-foreground))",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--color-border))" }}
              interval={0}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{
                fill: "rgb(var(--color-muted-foreground))",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
              tickLine={false}
              axisLine={false}
              width={42}
              domain={[0, 35]}
            />
            <ReferenceLine
              y={INCOME_QUINTILE_NATIONAL}
              stroke="rgb(var(--color-foreground) / 0.5)"
              strokeDasharray="4 4"
              label={{
                value: DETERMINANT_COPY.quintileNationalLabel,
                position: "insideTopRight",
                fontSize: 11,
                fontFamily: "var(--font-sans)",
                fill: "rgb(var(--color-foreground) / 0.7)",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => {
                const fill = QUINTILE_COLORS[index] ?? "rgb(var(--quintile-3))";
                const isActive = activeIndex === null || index === activeIndex;
                return (
                  <Cell
                    key={entry.id}
                    fill={fill}
                    fillOpacity={isActive ? 1 : 0.22}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
