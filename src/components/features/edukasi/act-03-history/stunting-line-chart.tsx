"use client";

/**
 * Scroll-driven stunting prevalence line chart (2013 → 2045).
 *
 * Hand-rolled SVG (no Recharts) so we have full control over the stroke
 * path-length animation tied to the parent ACT's pinned-scroll progress.
 * As the user scrolls through ACT 3, the line traces from 2013 leftward
 * across the timeline; each data point marker fades in as the line crosses
 * its year. Year + value labels appear with the marker so the reader can
 * follow the trajectory without a tooltip.
 *
 * When no `progress` is supplied (reduced-motion fallback or stand-alone
 * usage), the line draws fully on mount and all markers are visible.
 */

import { useMemo } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import {
  STUNTING_TIMELINE,
  STUNTING_TIMELINE_DOMAIN,
  type StuntingTimelinePoint,
} from "@/data/edukasi/stunting-timeline";

const VIEW_W = 800;
const VIEW_H = 360;
const PAD = { top: 32, right: 40, bottom: 56, left: 56 } as const;
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

const FIRST_YEAR = STUNTING_TIMELINE[0]?.year ?? 2013;
const LAST_YEAR = STUNTING_TIMELINE[STUNTING_TIMELINE.length - 1]?.year ?? 2045;

function toX(year: number): number {
  const ratio = (year - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR);
  return PAD.left + ratio * PLOT_W;
}
function toY(prev: number): number {
  const { yMin, yMax } = STUNTING_TIMELINE_DOMAIN;
  const ratio = (yMax - prev) / (yMax - yMin);
  return PAD.top + ratio * PLOT_H;
}

const Y_TICKS = [0, 10, 20, 30, 40] as const;
const TARGET_2029 = 14.2;

export interface StuntingLineChartProps {
  /**
   * Scroll progress 0→1 from the parent `PinnedSection`. When provided,
   * the line stroke and marker opacities are tied to scroll. When omitted,
   * the chart renders in its end-state (fully drawn) — used for the
   * reduced-motion fallback and any future stand-alone embed.
   */
  readonly progress?: MotionValue<number>;
}

export function StuntingLineChart({ progress }: StuntingLineChartProps) {
  const reduceMotion = useReducedMotion();
  const fallback = useMotionValue(1);
  const activeProgress = progress && !reduceMotion ? progress : fallback;

  const pathD = useMemo(() => {
    const points = STUNTING_TIMELINE.map(
      (p) => `${toX(p.year)},${toY(p.prevalencePct)}`,
    );
    return `M ${points.join(" L ")}`;
  }, []);

  // strokeDashoffset 1 → 0 traces the line as progress 0 → 1. Combined
  // with strokeDasharray="1" and pathLength={1} so the stroke math stays
  // independent of the path's actual pixel length.
  const dashOffset = useTransform(activeProgress, [0, 1], [1, 0]);

  return (
    <figure
      className="not-prose rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
      aria-label="Prevalensi stunting Indonesia 2013 hingga 2045"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-72 w-full sm:h-80 md:h-96"
        role="img"
      >
        {/* Y-axis grid lines + tick labels */}
        {Y_TICKS.map((tick) => {
          const y = toY(tick);
          return (
            <g key={`yt-${tick}`}>
              <line
                x1={PAD.left}
                x2={VIEW_W - PAD.right}
                y1={y}
                y2={y}
                stroke="rgb(var(--color-border))"
                strokeWidth="1"
                strokeDasharray="3 6"
              />
              <text
                x={PAD.left - 10}
                y={y}
                dy="0.32em"
                textAnchor="end"
                fontFamily="var(--font-sans)"
                fontSize="12"
                fill="rgb(var(--color-muted-foreground))"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Target 2029 reference line */}
        <line
          x1={PAD.left}
          x2={VIEW_W - PAD.right}
          y1={toY(TARGET_2029)}
          y2={toY(TARGET_2029)}
          stroke="rgb(var(--color-foreground) / 0.4)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text
          x={VIEW_W - PAD.right - 4}
          y={toY(TARGET_2029) - 6}
          textAnchor="end"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="rgb(var(--color-foreground) / 0.7)"
        >
          Target 2029 — 14,2%
        </text>

        {/* X-axis baseline */}
        <line
          x1={PAD.left}
          x2={VIEW_W - PAD.right}
          y1={VIEW_H - PAD.bottom}
          y2={VIEW_H - PAD.bottom}
          stroke="rgb(var(--color-border))"
          strokeWidth="1"
        />

        {/* The animated line. `pathLength={1}` + `strokeDasharray="1 1"` +
            animated `strokeDashoffset` draws the line as a single stroke
            tied to scroll, regardless of the path's pixel length. */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgb(var(--color-primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: dashOffset }}
        />

        {/* Data point markers + value labels — each fades in as the line
            reaches its threshold along the path. */}
        {STUNTING_TIMELINE.map((point, index) => {
          const threshold = index / (STUNTING_TIMELINE.length - 1);
          return (
            <DataPointMarker
              key={point.year}
              point={point}
              threshold={threshold}
              progress={activeProgress}
            />
          );
        })}

        {/* X-axis year labels (always visible). */}
        {STUNTING_TIMELINE.map((point) => (
          <text
            key={`xt-${point.year}`}
            x={toX(point.year)}
            y={VIEW_H - PAD.bottom + 22}
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="11"
            fill="rgb(var(--color-muted-foreground))"
          >
            {point.year}
          </text>
        ))}
      </svg>
    </figure>
  );
}

function DataPointMarker({
  point,
  threshold,
  progress,
}: {
  readonly point: StuntingTimelinePoint;
  readonly threshold: number;
  readonly progress: MotionValue<number>;
}) {
  const opacity = useTransform(
    progress,
    [Math.max(0, threshold - 0.05), threshold + 0.02],
    [0, 1],
  );
  const cx = toX(point.year);
  const cy = toY(point.prevalencePct);
  const fillColor =
    point.kind === "target"
      ? "rgb(var(--edu-hl-warm))"
      : point.highlight
        ? "rgb(var(--color-accent))"
        : "rgb(var(--color-primary))";

  return (
    <motion.g style={{ opacity }}>
      <circle
        cx={cx}
        cy={cy}
        r="6"
        fill={fillColor}
        stroke="rgb(var(--color-surface))"
        strokeWidth="2"
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="12"
        fontWeight="600"
        fill="rgb(var(--color-foreground))"
      >
        {point.prevalencePct.toLocaleString("id-ID", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        %
      </text>
    </motion.g>
  );
}
