"use client";

// Client component: feeds the trend chart from the cross-filter context so the
// region overlay and active-year marker react without a server round-trip.

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { Card } from "@/components/primitives/card";
import { Skeleton } from "@/components/primitives/skeleton";
import { DASHBOARD_TREND } from "@/config/dashboard";

import { useDashboardFilter } from "./dashboard-filter-context";
import {
  selectNationalTrendPoints,
  selectRegionRow,
  selectRegionTrendPoints,
} from "./dashboard-selectors";

// Code-split Recharts out of the route's initial bundle: the chart is the
// single heaviest client dependency on /data and hydrating it competes with
// first paint on throttled mobile CPUs. The fixed-height skeleton reserves
// the exact chart box so the swap is layout-shift free.
const PrevalenceTrendChart = dynamic(
  () =>
    import("./prevalence-trend-chart").then(
      (module) => module.PrevalenceTrendChart,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton
        className="w-full"
        style={{ height: DASHBOARD_TREND.chartHeightPx }}
      />
    ),
  },
);

export interface TrendSectionProps {
  readonly dataset: DashboardDatasetDto;
}

export function TrendSection({ dataset }: TrendSectionProps) {
  const { year, selectedKodeBps } = useDashboardFilter();

  // The Recharts chunk only loads once the section nears the viewport: on
  // mobile this card sits below the fold, so downloading and hydrating the
  // chart during initial load burned main-thread time that delayed LCP.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartInView, setChartInView] = useState<boolean>(false);
  useEffect(() => {
    const node = containerRef.current;
    if (node === null || chartInView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setChartInView(true);
        }
      },
      { rootMargin: DASHBOARD_TREND.chartInViewRootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [chartInView]);

  const national = useMemo(() => selectNationalTrendPoints(dataset), [dataset]);
  const regionSeries = useMemo(
    () =>
      selectedKodeBps === null
        ? undefined
        : selectRegionTrendPoints(dataset, selectedKodeBps),
    [dataset, selectedKodeBps],
  );
  const regionLabel =
    selectedKodeBps === null
      ? undefined
      : selectRegionRow(dataset, selectedKodeBps)?.kabupatenKota;

  return (
    <Card elevation="sm" padding="md" className="flex h-full flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">
          {DASHBOARD_TREND.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {selectedKodeBps === null
            ? DASHBOARD_TREND.selectRegionHint
            : DASHBOARD_TREND.description}
        </p>
      </header>
      <div ref={containerRef}>
        {chartInView ? (
          <PrevalenceTrendChart
            points={national}
            activeYear={year}
            {...(regionSeries ? { regionSeries } : {})}
            {...(regionLabel ? { regionLabel } : {})}
          />
        ) : (
          <Skeleton
            className="w-full"
            style={{ height: DASHBOARD_TREND.chartHeightPx }}
          />
        )}
      </div>
    </Card>
  );
}
