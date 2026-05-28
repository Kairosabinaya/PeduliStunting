"use client";

// Client component because Recharts depends on the browser SVG runtime and
// our tooltip + animation use motion.

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "motion/react";

import { HISTORY_COPY } from "@/config/edukasi";
import {
  STUNTING_TIMELINE,
  STUNTING_TIMELINE_DOMAIN,
  type StuntingTimelinePoint,
} from "@/data/edukasi/stunting-timeline";

/**
 * Shape consumed by Recharts. Splits the prevalence into `actualValue` and
 * `targetValue` columns so the chart can draw two stylistically distinct
 * series (solid line for historicals, dashed for targets) without forcing
 * `null` markers to appear awkwardly on either series.
 */
interface ChartDatum {
  readonly year: number;
  readonly actualValue: number | null;
  readonly targetValue: number | null;
  readonly source: string;
  readonly note: string | null;
  readonly highlight: boolean;
  readonly kind: "actual" | "target";
}

function toChartData(): readonly ChartDatum[] {
  return STUNTING_TIMELINE.map(
    (point: StuntingTimelinePoint): ChartDatum => ({
      year: point.year,
      actualValue: point.kind === "actual" ? point.prevalencePct : null,
      targetValue: point.kind === "target" ? point.prevalencePct : null,
      source: point.source,
      note: point.note ?? null,
      highlight: point.highlight ?? false,
      kind: point.kind,
    }),
  );
}

// The Recharts `<Tooltip content={...}>` expects a function whose payload
// type is generic over ValueType/NameType. We have a concrete shape, so
// we type the parameter as `unknown` and narrow inside — keeps project guidelines
// §5 "narrow at the boundary" honoured without leaking library generics
// into the rest of the file.
function renderTooltip(rawProps: unknown): React.ReactNode {
  if (typeof rawProps !== "object" || rawProps === null) return null;
  const props = rawProps as {
    readonly active?: boolean;
    readonly payload?: readonly { readonly payload?: ChartDatum }[];
  };
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;
  const value = datum.kind === "actual" ? datum.actualValue : datum.targetValue;
  if (value === null) return null;
  const formatted = value.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return (
    <div className="glass-panel rounded-lg px-3 py-2 text-xs leading-relaxed">
      <p className="text-foreground">
        <span className="font-semibold text-primary">{datum.year}</span>
        <span> · </span>
        <span className="font-semibold tabular-nums">{formatted}%</span>
      </p>
      <p className="mt-1 text-muted-foreground">
        {HISTORY_COPY.tooltipSourcePrefix}: {datum.source}
      </p>
      {datum.note ? (
        <p className="mt-1 max-w-[18rem] text-muted-foreground">{datum.note}</p>
      ) : null}
    </div>
  );
}

export function StuntingLineChart() {
  const data = useMemo(() => toChartData(), []);
  const reduceMotion = useReducedMotion();

  return (
    <figure
      className="not-prose rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
      aria-label={HISTORY_COPY.chartTitle}
    >
      <div className="h-72 w-full sm:h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%" minHeight={288}>
          <ComposedChart
            data={data as ChartDatum[]}
            margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
          >
            <defs>
              <linearGradient
                id="edu-actual-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="rgb(var(--color-primary))"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="rgb(var(--color-primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgb(var(--color-border))"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{
                fill: "rgb(var(--color-muted-foreground))",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--color-border))" }}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              domain={[
                STUNTING_TIMELINE_DOMAIN.yMin,
                STUNTING_TIMELINE_DOMAIN.yMax,
              ]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{
                fill: "rgb(var(--color-muted-foreground))",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={{
                stroke: "rgb(var(--color-primary)/0.4)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={renderTooltip}
            />
            <ReferenceLine
              y={14.2}
              stroke="rgb(var(--color-accent))"
              strokeDasharray="6 4"
              label={{
                value: "Target 2029",
                position: "insideTopRight",
                fontSize: 11,
                fill: "rgb(var(--color-accent))",
              }}
            />
            <Area
              type="monotone"
              dataKey="actualValue"
              stroke="rgb(var(--color-primary))"
              strokeWidth={2.5}
              fill="url(#edu-actual-gradient)"
              connectNulls
              dot={{
                stroke: "rgb(var(--color-primary))",
                strokeWidth: 2,
                fill: "rgb(var(--color-background))",
                r: 4,
              }}
              activeDot={{ r: 6 }}
              isAnimationActive={!reduceMotion}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="targetValue"
              stroke="rgb(var(--color-primary-soft))"
              strokeWidth={2}
              strokeDasharray="6 6"
              connectNulls
              dot={{
                stroke: "rgb(var(--color-primary-soft))",
                strokeWidth: 2,
                fill: "rgb(var(--color-background))",
                r: 4,
              }}
              isAnimationActive={!reduceMotion}
              animationDuration={1200}
              animationBegin={600}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {HISTORY_COPY.chartDescription}
      </figcaption>
      <div
        className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-6 rounded-full bg-primary"
          />
          {HISTORY_COPY.legendActual}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-6 border-t-2 border-dashed border-primary-soft"
          />
          {HISTORY_COPY.legendTarget}
        </span>
      </div>
    </figure>
  );
}
