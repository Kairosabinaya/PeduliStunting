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
    (p): p is HistoryPoint & { observed: number } =>
      typeof p.observed === "number",
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
    return PADDING_X + ((tahun - yearMin) / yearSpan) * (WIDTH - PADDING_X * 2);
  }
  function y(prev: number): number {
    const innerHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const t = (prev - minPrev) / range;
    return PADDING_TOP + innerHeight * (1 - t);
  }

  const linePath = observedPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.tahun)},${y(p.observed)}`)
    .join(" ");
  // Area path: trace the line, then close back along the baseline so the
  // resulting polygon can be filled with a fade-to-transparent gradient.
  const baselineY = HEIGHT - PADDING_BOTTOM;
  const firstPoint = observedPoints[0];
  const lastPoint = observedPoints[observedPoints.length - 1];
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L${x(lastPoint.tahun)},${baselineY} L${x(firstPoint.tahun)},${baselineY} Z`
      : "";

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
        <defs>
          {/*
            Two-layer gradient under the line:
              1. Horizontal linear gradient with a stop at each year's
                 x-position carrying that year's category colour. SVG
                 interpolates between adjacent stops, so a Rendah→Sedang
                 transition reads as a smooth green→yellow blend (and the
                 transition lines up with the data point on the line).
              2. A luminance mask that fades the result vertically from
                 ~40% visibility at the line down to 0% at the baseline,
                 keeping the chart calm and readable.
            `gradientUnits="userSpaceOnUse"` so the offsets we compute map
            directly to SVG coordinates (the same space the line/dots use).
          */}
          {firstPoint && lastPoint ? (
            <linearGradient
              id="history-area-x"
              x1={x(firstPoint.tahun)}
              y1="0"
              x2={x(lastPoint.tahun)}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              {observedPoints.map((p) => {
                const span = Math.max(lastPoint.tahun - firstPoint.tahun, 1);
                const offsetPct = ((p.tahun - firstPoint.tahun) / span) * 100;
                const category = p.observedCategory ?? "Sedang";
                return (
                  <stop
                    key={p.tahun}
                    offset={`${offsetPct}%`}
                    className={CATEGORY_TEXT_CLASS[category]}
                    stopColor="currentColor"
                  />
                );
              })}
            </linearGradient>
          ) : null}
          <linearGradient id="history-area-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0.42} />
            <stop offset="100%" stopColor="black" stopOpacity={1} />
          </linearGradient>
          <mask
            id="history-area-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
          >
            <rect
              x="0"
              y="0"
              width={WIDTH}
              height={HEIGHT}
              fill="url(#history-area-fade)"
            />
          </mask>
        </defs>
        <g aria-hidden>
          {[0, 0.5, 1].map((t) => {
            const yPos =
              PADDING_TOP + (HEIGHT - PADDING_TOP - PADDING_BOTTOM) * t;
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
        {areaPath ? (
          <path
            d={areaPath}
            fill="url(#history-area-x)"
            stroke="none"
            mask="url(#history-area-mask)"
          />
        ) : null}
        <path
          d={linePath}
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
