"use client";

// Client component: feeds the trend chart from the cross-filter context so the
// region overlay and active-year marker react without a server round-trip.

import { useMemo } from "react";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { Card } from "@/components/primitives/card";
import { DASHBOARD_TREND } from "@/config/dashboard";

import { useDashboardFilter } from "./dashboard-filter-context";
import {
  selectNationalTrendPoints,
  selectRegionRow,
  selectRegionTrendPoints,
} from "./dashboard-selectors";
import { PrevalenceTrendChart } from "./prevalence-trend-chart";

export interface TrendSectionProps {
  readonly dataset: DashboardDatasetDto;
}

export function TrendSection({ dataset }: TrendSectionProps) {
  const { year, selectedKodeBps } = useDashboardFilter();

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
      <PrevalenceTrendChart
        points={national}
        activeYear={year}
        {...(regionSeries ? { regionSeries } : {})}
        {...(regionLabel ? { regionLabel } : {})}
      />
    </Card>
  );
}
