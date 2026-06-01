"use client";

// Client component: reflects the selected region from the cross-filter context.

import { useMemo } from "react";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { Badge } from "@/components/primitives/badge";
import { Card } from "@/components/primitives/card";
import { DASHBOARD_SPOTLIGHT } from "@/config/dashboard";

import { useDashboardFilter } from "./dashboard-filter-context";
import {
  selectRegionRank,
  selectRegionRow,
  selectRegionTrendPoints,
} from "./dashboard-selectors";

export interface RegionSpotlightCardProps {
  readonly dataset: DashboardDatasetDto;
}

const SPARK_WIDTH = 240;
const SPARK_HEIGHT = 64;
const SPARK_PAD = 10;

/**
 * Per-region detail that appears when a region is selected. Keeps the national
 * KPIs untouched: this is where the region filter "lands" — prevalence at the
 * selected year, national rank, category, and a compact multi-year sparkline.
 */
export function RegionSpotlightCard({ dataset }: RegionSpotlightCardProps) {
  const { year, selectedKodeBps, clearSelection } = useDashboardFilter();

  const region = useMemo(
    () =>
      selectedKodeBps === null
        ? undefined
        : selectRegionRow(dataset, selectedKodeBps),
    [dataset, selectedKodeBps],
  );

  const trend = useMemo(
    () =>
      selectedKodeBps === null
        ? []
        : selectRegionTrendPoints(dataset, selectedKodeBps),
    [dataset, selectedKodeBps],
  );

  if (selectedKodeBps === null || region === undefined) return null;

  const current = region.byYear[year];
  const rank = selectRegionRank(dataset, year, selectedKodeBps);
  const numeric = trend.filter(
    (point): point is { tahun: number; prevalence: number } =>
      typeof point.prevalence === "number",
  );

  return (
    <Card
      elevation="sm"
      padding="md"
      className="border-primary/20 bg-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-ink">
            {DASHBOARD_SPOTLIGHT.eyebrow}
          </p>
          <h3 className="truncate text-lg font-semibold text-foreground">
            {region.kabupatenKota}
          </h3>
          <p className="text-sm text-muted-foreground">{region.provinsi}</p>
        </div>
        <button
          type="button"
          onClick={() => clearSelection()}
          aria-label={DASHBOARD_SPOTLIGHT.closeLabel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <dl className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {DASHBOARD_SPOTLIGHT.prevalenceLabel} {year}
            </dt>
            <dd className="mt-1 flex items-center gap-2">
              {current && typeof current.prevalence === "number" ? (
                <>
                  <span className="stat-number text-3xl font-bold tracking-tight text-foreground">
                    {current.prevalence.toFixed(1)}%
                  </span>
                  <Badge tone="neutral">{current.category}</Badge>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {DASHBOARD_SPOTLIGHT.noPrevalence}
                </span>
              )}
            </dd>
          </div>
          {rank ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {DASHBOARD_SPOTLIGHT.rankLabel}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {rank.rank}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {DASHBOARD_SPOTLIGHT.rankUnit} {rank.total}
                </span>
              </dd>
            </div>
          ) : null}
        </dl>

        {numeric.length >= 2 ? (
          <Sparkline points={numeric} activeYear={year} />
        ) : null}
      </div>
    </Card>
  );
}

interface SparklineProps {
  readonly points: readonly { tahun: number; prevalence: number }[];
  readonly activeYear: number;
}

/** Compact multi-year prevalence sparkline (pure SVG, token-coloured). */
function Sparkline({ points, activeYear }: SparklineProps) {
  const values = points.map((point) => point.prevalence);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = SPARK_WIDTH - SPARK_PAD * 2;
  const innerH = SPARK_HEIGHT - SPARK_PAD * 2;
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    tahun: point.tahun,
    x: SPARK_PAD + step * index,
    y: SPARK_PAD + innerH - ((point.prevalence - min) / span) * innerH,
  }));
  const path = coords
    .map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x} ${coord.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
      className="h-16 w-full"
      role="img"
      aria-label={DASHBOARD_SPOTLIGHT.trendLabel}
    >
      <path
        d={path}
        fill="none"
        stroke="rgb(var(--color-accent))"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((coord) => (
        <circle
          key={coord.tahun}
          cx={coord.x}
          cy={coord.y}
          r={coord.tahun === activeYear ? 4 : 2.5}
          className={
            coord.tahun === activeYear ? "fill-primary" : "fill-accent"
          }
        />
      ))}
    </svg>
  );
}
