/**
 * Tiny inline line chart for the region-detail popup. Renders the four-year
 * prevalence trajectory plus dotted-line predicted trajectory.
 *
 * Why not Nivo here? The page-level chart library decision (ADR-0003) keeps
 * Nivo reserved for the Tracker z-score curves, which need axes, tooltips
 * and animations. A four-point map sparkline is so cheap in raw SVG (<2KB
 * client JS, server-rendered) that adding a chart library round-trip costs
 * more than it saves. The shape mirrors ADR-0002's hand-rolled choropleth.
 */

import {
  CATEGORY_BG_CLASS,
  CATEGORY_TEXT_CLASS,
  MAP_DETAIL_COPY,
} from "@/config/map";
import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import { cn } from "@/lib/cn";

export interface HistoryPoint {
  readonly tahun: number;
  readonly observed: number | null;
  readonly observedCategory: StuntingCategory | null;
  readonly predictedCategory: StuntingCategory | null;
}

export interface MiniHistoryChartProps {
  readonly points: readonly HistoryPoint[];
  readonly activeTahun: number;
  readonly className?: string;
}

const WIDTH = 320;
const HEIGHT = 120;
const PADDING_X = 32;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;

export function MiniHistoryChart({
  points,
  activeTahun,
  className,
}: MiniHistoryChartProps) {
  const observedPoints = points.filter(
    (p): p is HistoryPoint & { observed: number } => typeof p.observed === "number",
  );

  if (points.length === 0 || observedPoints.length === 0) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border bg-surface-muted/40 p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        {MAP_DETAIL_COPY.historyEmpty}
      </p>
    );
  }

  const minPrev = Math.min(...observedPoints.map((p) => p.observed));
  const maxPrev = Math.max(...observedPoints.map((p) => p.observed));
  const range = Math.max(maxPrev - minPrev, 1); // floor at 1 to avoid flat collapse
  const yearMin = points[0]?.tahun ?? activeTahun;
  const yearMax = points[points.length - 1]?.tahun ?? yearMin;
  const yearSpan = Math.max(yearMax - yearMin, 1);

  function x(tahun: number): number {
    return (
      PADDING_X +
      ((tahun - yearMin) / yearSpan) * (WIDTH - PADDING_X * 2)
    );
  }
  function y(prev: number): number {
    const innerHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const t = (prev - minPrev) / range;
    return PADDING_TOP + innerHeight * (1 - t);
  }

  const path = observedPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.tahun)},${y(p.observed)}`)
    .join(" ");

  const titleSuffix =
    yearMin === yearMax ? `${yearMin}` : `${yearMin} – ${yearMax}`;
  return (
    <figure className={cn("space-y-2", className)}>
      <figcaption className="text-xs font-medium text-muted-foreground">
        {MAP_DETAIL_COPY.historyTitlePrefix} {titleSuffix}
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Tren prevalensi stunting tahun ${yearMin}–${yearMax}.`}
        className="h-auto w-full"
      >
        <g aria-hidden>
          {[0, 0.5, 1].map((t) => {
            const yPos = PADDING_TOP + (HEIGHT - PADDING_TOP - PADDING_BOTTOM) * t;
            return (
              <line
                key={t}
                x1={PADDING_X}
                x2={WIDTH - PADDING_X / 2}
                y1={yPos}
                y2={yPos}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            );
          })}
        </g>
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-primary"
        />
        {observedPoints.map((p) => {
          const isActive = p.tahun === activeTahun;
          const r = isActive ? 5 : 3;
          const category = p.observedCategory ?? "Sedang";
          return (
            <g key={p.tahun}>
              <circle
                cx={x(p.tahun)}
                cy={y(p.observed)}
                r={r}
                className={cn(
                  isActive ? CATEGORY_BG_CLASS[category] : "fill-surface",
                  "stroke-primary",
                )}
                strokeWidth={isActive ? 1.5 : 1}
              />
              <text
                x={x(p.tahun)}
                y={HEIGHT - 6}
                textAnchor="middle"
                className={cn(
                  "text-[10px] tabular-nums",
                  isActive
                    ? cn("font-semibold", CATEGORY_TEXT_CLASS[category])
                    : "fill-muted-foreground",
                )}
                fill="currentColor"
              >
                {p.tahun}
              </text>
              <text
                x={x(p.tahun)}
                y={y(p.observed) - 8}
                textAnchor="middle"
                className={cn(
                  "text-[10px] tabular-nums",
                  isActive
                    ? "font-semibold text-foreground"
                    : "fill-muted-foreground",
                )}
                fill="currentColor"
              >
                {p.observed.toLocaleString("id-ID", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
