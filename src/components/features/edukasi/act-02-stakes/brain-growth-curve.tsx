"use client";

/**
 * ACT 2 (Frame 3) — brain-development "growth curve". Replaces the trio of
 * separate stat boxes (25% / 70% / 85%) with a single ascending curve so the
 * three figures read as one rising trajectory rather than three
 * interchangeable cards. Hand-rolled like `stunting-line-chart.tsx`: an inline
 * `<svg>` draws the gradient area + connecting line, while the count-up values
 * and the age legend are laid over / under it in HTML so we can reuse
 * `AnimatedCounter`.
 *
 * The `<svg>` stretches to fill its box (`preserveAspectRatio="none"`) so the
 * line stays aligned with the percentage-positioned markers; the
 * `non-scaling-stroke` vector effect keeps the stroke an even weight despite
 * the non-uniform stretch.
 *
 * @example In the pinned stakes section
 * ```tsx
 * <BrainGrowthCurve enabled={cardsActive} />
 * ```
 */

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

import { BRAIN_DEVELOPMENT_TILES } from "@/config/edukasi";
import { cn } from "@/lib/cn";

import { AnimatedCounter } from "../primitives/animated-counter";

// Marker x positions (percent) aligned to the three equal legend columns
// below, so each curve point sits directly above its caption on desktop.
const POINT_X_PCT = [50 / 3, 50, 250 / 3] as const;

// Map a 0..100 value to a top-offset percentage inside the curve box. A higher
// value sits higher (smaller top%). The plot band is kept clear of the edges
// so the floating numbers and the baseline have room to breathe.
const PLOT_TOP_PCT = 24;
const PLOT_BOTTOM_PCT = 82;
const AREA_BASELINE_PCT = 90;

function valueToTopPct(value: number): number {
  return PLOT_BOTTOM_PCT - (value / 100) * (PLOT_BOTTOM_PCT - PLOT_TOP_PCT);
}

type BrainTone = (typeof BRAIN_DEVELOPMENT_TILES)[number]["tone"];

const TONE_DOT: Record<BrainTone, string> = {
  primary: "bg-primary",
  success: "bg-accent",
  warm: "bg-edu-warm",
};

interface CurvePoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Catmull-Rom-to-Bezier smoothing so the three points read as a flowing curve
 * rather than two straight segments. Endpoints are duplicated for the tangent
 * estimates. Guards keep it safe under `noUncheckedIndexedAccess`.
 */
function smoothLinePath(points: readonly CurvePoint[]): string {
  const first = points[0];
  if (!first) return "";
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) continue;
    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export interface BrainGrowthCurveProps {
  /** Gate the count-up + line draw until the owning frame is visible. */
  readonly enabled?: boolean;
}

export function BrainGrowthCurve({ enabled = true }: BrainGrowthCurveProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();

  const points = useMemo<readonly CurvePoint[]>(
    () =>
      BRAIN_DEVELOPMENT_TILES.map((tile, index) => ({
        x: POINT_X_PCT[index] ?? 50,
        y: valueToTopPct(tile.value),
      })),
    [],
  );

  const linePath = useMemo(() => smoothLinePath(points), [points]);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x} ${AREA_BASELINE_PCT} L ${firstPoint.x} ${AREA_BASELINE_PCT} Z`
      : "";

  return (
    <figure className="w-full max-w-4xl">
      <div className="relative h-48 w-full sm:h-56">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="rgb(var(--color-primary))"
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor="rgb(var(--color-primary))"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {areaPath ? (
            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
          ) : null}
          <motion.path
            d={linePath}
            fill="none"
            stroke="rgb(var(--color-primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduceMotion ? 1 : 0 }}
            animate={{ pathLength: reduceMotion || enabled ? 1 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.9, ease: [0.2, 0, 0, 1] }
            }
          />
        </svg>

        {/* Floating count-up values + markers sitting on the curve. */}
        {BRAIN_DEVELOPMENT_TILES.map((tile, index) => {
          const point = points[index];
          if (!point) return null;
          return (
            <div
              key={tile.caption}
              className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span className="text-3xl font-bold leading-none tracking-tight text-primary sm:text-4xl">
                <AnimatedCounter
                  value={tile.value}
                  suffix={tile.suffix}
                  className="inline-block"
                  enabled={enabled}
                />
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-2 h-3 w-3 rounded-full ring-4 ring-surface",
                  TONE_DOT[tile.tone],
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Age + helper legend, aligned under each curve point on desktop and
          stacked on mobile. */}
      <figcaption className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
        {BRAIN_DEVELOPMENT_TILES.map((tile) => (
          <div key={tile.caption} className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {tile.caption}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">
              {tile.helper}
            </p>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
