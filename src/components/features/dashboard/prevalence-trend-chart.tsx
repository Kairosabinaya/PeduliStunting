"use client";

// Client component: Recharts measures the DOM, and we gate entry animation on
// prefers-reduced-motion. An explicit numeric ResponsiveContainer height (plus
// the chart only mounting inside its active tab) avoids the width/height(-1)
// measurement failure.

import { useReducedMotion } from "motion/react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DASHBOARD_TREND } from "@/config/dashboard";
import { NATIONAL_CONTEXT } from "@/config/national-context";

import { DashboardTooltip } from "./dashboard-tooltip";

export interface TrendPoint {
  readonly tahun: number;
  readonly crossRegion: number;
  readonly national: number | null;
}

export interface PrevalenceTrendChartProps {
  readonly points: readonly TrendPoint[];
}

const GRID_COLOR = "rgb(var(--color-border))";
const TICK_COLOR = "rgb(var(--color-muted-foreground))";

export function PrevalenceTrendChart({ points }: PrevalenceTrendChartProps) {
  const reduceMotion = useReducedMotion();
  const animate = reduceMotion !== true;

  return (
    <div
      role="img"
      aria-label={DASHBOARD_TREND.title}
      className="w-full select-none"
    >
      <ResponsiveContainer width="100%" height={340} minHeight={260}>
        <ComposedChart
          data={[...points]}
          margin={{ top: 12, right: 18, bottom: 4, left: -8 }}
        >
          <defs>
            <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="rgb(var(--color-primary))"
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor="rgb(var(--color-primary))"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke={GRID_COLOR}
            vertical={false}
          />
          <XAxis
            dataKey="tahun"
            stroke={GRID_COLOR}
            tick={{ fill: TICK_COLOR, fontSize: 12 }}
            tickMargin={8}
            allowDecimals={false}
          />
          <YAxis
            stroke={GRID_COLOR}
            tick={{ fill: TICK_COLOR, fontSize: 12 }}
            domain={[0, 35]}
            tickMargin={6}
            width={40}
            unit="%"
          />
          <Tooltip
            content={<DashboardTooltip unit="%" />}
            cursor={{ stroke: "rgb(var(--color-primary))", strokeWidth: 1 }}
          />
          <ReferenceLine
            y={NATIONAL_CONTEXT.whoThresholdVeryHigh}
            stroke="rgb(var(--color-ordinal-tinggi))"
            strokeDasharray="5 5"
            label={{
              value: DASHBOARD_TREND.whoVeryHighLabel,
              position: "insideTopRight",
              fill: "rgb(var(--color-ordinal-tinggi))",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={NATIONAL_CONTEXT.whoThresholdHigh}
            stroke="rgb(var(--color-ordinal-sedang))"
            strokeDasharray="5 5"
            label={{
              value: DASHBOARD_TREND.whoHighLabel,
              position: "insideTopRight",
              fill: "rgb(var(--color-ordinal-sedang-foreground))",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={NATIONAL_CONTEXT.rpjmnTarget2029}
            stroke="rgb(var(--color-accent))"
            strokeDasharray="6 3"
            label={{
              value: DASHBOARD_TREND.targetLabel,
              position: "insideBottomRight",
              fill: "rgb(var(--color-accent-foreground))",
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="crossRegion"
            name={DASHBOARD_TREND.crossRegionLabel}
            stroke="rgb(var(--color-primary))"
            strokeWidth={3}
            fill="url(#trendArea)"
            dot={{ r: 4, strokeWidth: 0, fill: "rgb(var(--color-primary))" }}
            activeDot={{
              r: 6,
              fill: "rgb(var(--color-surface))",
              stroke: "rgb(var(--color-primary))",
              strokeWidth: 2,
            }}
            isAnimationActive={animate}
            animationDuration={700}
          />
          <Line
            type="monotone"
            dataKey="national"
            name={DASHBOARD_TREND.nationalLabel}
            stroke="rgb(var(--color-primary-soft))"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: "rgb(var(--color-primary-soft))" }}
            isAnimationActive={animate}
            animationDuration={700}
            connectNulls
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="plainline"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
