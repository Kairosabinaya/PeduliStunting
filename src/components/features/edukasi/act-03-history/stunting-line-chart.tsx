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

import { useId, useMemo } from "react";
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
// Padding tuned so the enlarged axis/value labels never clip: extra top room
// for the tall 2013 value label, wider left gutter for the larger y-tick text.
const PAD = { top: 44, right: 48, bottom: 56, left: 60 } as const;
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
  const gradientId = useId();
  const clipId = useId();

  const { pathD, areaD } = useMemo(() => {
    const coords = STUNTING_TIMELINE.map((p) => ({
      x: toX(p.year),
      y: toY(p.prevalencePct),
    }));
    const line = `M ${coords.map((c) => `${c.x},${c.y}`).join(" L ")}`;
    const baseY = VIEW_H - PAD.bottom;
    const firstX = coords[0]?.x ?? PAD.left;
    const lastX = coords[coords.length - 1]?.x ?? VIEW_W - PAD.right;
    const area = `M ${firstX},${baseY} L ${coords
      .map((c) => `${c.x},${c.y}`)
      .join(" L ")} L ${lastX},${baseY} Z`;
    return { pathD: line, areaD: area };
  }, []);

  // The line + gradient area are revealed left-to-right by an animated clip
  // rect whose width tracks scroll progress, so the trajectory "draws in" as
  // the reader scrolls through the pinned ACT.
  const clipWidth = useTransform(
    activeProgress,
    [0, 1],
    [0, VIEW_W - PAD.left],
  );

  return (
    <figure
      // No card chrome — the chart sits directly on the section background.
      // Strokes and text use theme tokens so it reads correctly on both
      // themes without a white backing.
      className="not-prose"
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
                x={PAD.left - 12}
                y={y}
                dy="0.32em"
                textAnchor="end"
                fontFamily="var(--font-sans)"
                fontSize="16"
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
          y={toY(TARGET_2029) - 8}
          textAnchor="end"
          fontFamily="var(--font-sans)"
          fontSize="15"
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

        {/* Gradient area + line, revealed left-to-right by the animated clip
            rect. The area uses a vertical primary→transparent gradient so the
            descent reads as a filled trajectory rather than a bare line. */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="rgb(var(--color-primary))"
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor="rgb(var(--color-primary))"
              stopOpacity="0"
            />
          </linearGradient>
          <clipPath id={clipId}>
            <motion.rect
              x={PAD.left}
              y={0}
              height={VIEW_H}
              style={{ width: clipWidth }}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={areaD} fill={`url(#${gradientId})`} stroke="none" />
          <path
            d={pathD}
            fill="none"
            stroke="rgb(var(--color-primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Data point markers + value labels — each fades in as the line
            reaches its threshold along the path. */}
        {STUNTING_TIMELINE.map((point, index) => {
          const threshold = index / (STUNTING_TIMELINE.length - 1);
          // Only the milestone points carry a value label — the same filter
          // used for the x-axis years — so the clustered mid-decade surveys
          // keep their dots without overlapping number labels.
          const showValue =
            index === 0 || point.highlight === true || point.kind === "target";
          return (
            <DataPointMarker
              key={point.year}
              point={point}
              threshold={threshold}
              progress={activeProgress}
              showValue={showValue}
              isFirst={index === 0}
              isLast={index === STUNTING_TIMELINE.length - 1}
            />
          );
        })}

        {/* X-axis year labels — only the milestone years (first reading, the
            latest "today" value, and the two targets) are labelled so the
            cluster of mid-decade surveys no longer overlaps. Intermediate
            years still surface their value label on their marker. */}
        {STUNTING_TIMELINE.map((point, index) => {
          const isKeyYear =
            index === 0 || point.highlight === true || point.kind === "target";
          if (!isKeyYear) return null;
          return (
            <text
              key={`xt-${point.year}`}
              x={toX(point.year)}
              y={VIEW_H - PAD.bottom + 26}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontSize="16"
              fontWeight={point.highlight ? 700 : 400}
              fill={
                point.highlight
                  ? "rgb(var(--color-foreground))"
                  : "rgb(var(--color-muted-foreground))"
              }
            >
              {point.year}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}

function DataPointMarker({
  point,
  threshold,
  progress,
  showValue,
  isFirst,
  isLast,
}: {
  readonly point: StuntingTimelinePoint;
  readonly threshold: number;
  readonly progress: MotionValue<number>;
  /** Whether to render the numeric value label near the dot. */
  readonly showValue: boolean;
  /** Leftmost point (2013) — its label sits to the RIGHT of the dot at dot
   *  height so it clears both the "40%" y-tick and the top-left corner. */
  readonly isFirst: boolean;
  /** Rightmost point (2045) — label anchored to the dot's left to stay in frame. */
  readonly isLast: boolean;
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

  // The latest "today" value (2024) gets a soft accent halo and a larger
  // dot so it reads as the anchor of the trajectory; the two targets sit a
  // touch larger than the routine survey points.
  const radius = point.highlight ? 7 : point.kind === "target" ? 6.5 : 5.5;

  return (
    <motion.g style={{ opacity }}>
      {point.highlight ? (
        <circle
          cx={cx}
          cy={cy}
          r={13}
          fill="rgb(var(--color-accent))"
          opacity={0.16}
        />
      ) : null}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor}
        stroke="rgb(var(--color-background))"
        strokeWidth="2"
      />
      {showValue ? (
        // Edge-aware placement so labels never collide with axis ticks or the
        // plot edge. The leftmost point (2013, also the highest at 37,2%) is
        // the only one that would hit the top-left "40%" tick if centred above
        // its dot — so it moves to the RIGHT of the dot at dot height instead.
        <text
          x={isFirst ? cx + 12 : isLast ? cx - 8 : cx}
          y={isFirst ? cy - 2 : cy - 16}
          textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
          fontFamily="var(--font-sans)"
          fontSize="16"
          fontWeight="700"
          fill="rgb(var(--color-foreground))"
        >
          {point.prevalencePct.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          %
        </text>
      ) : null}
    </motion.g>
  );
}
