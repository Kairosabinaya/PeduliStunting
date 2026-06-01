"use client";

// Client component: recomputes the four KPI tiles whenever the year filter
// changes (via the dashboard filter context).

import { useMemo } from "react";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { DASHBOARD_KPI } from "@/config/dashboard";

import { useDashboardFilter } from "./dashboard-filter-context";
import { selectInsightsForYear } from "./dashboard-selectors";
import { StatCard, type StatCardProps } from "./stat-card";

export interface KpiCardsProps {
  readonly dataset: DashboardDatasetDto;
}

function share(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/**
 * Four national headline tiles: mean prevalence + shares of Tinggi / Sedang /
 * Rendah categories, all recomputed for the selected year.
 */
export function KpiCards({ dataset }: KpiCardsProps) {
  const { year } = useDashboardFilter();

  const tiles = useMemo<readonly StatCardProps[]>(() => {
    const insights = selectInsightsForYear(dataset, year);
    const focusIndex = insights.perYear.findIndex(
      (point) => point.tahun === insights.focusYear,
    );
    const focus = focusIndex >= 0 ? insights.perYear[focusIndex] : undefined;
    const mean = focus?.meanPrevalence ?? 0;
    const regionCount = focus?.regionCount ?? 0;

    return [
      {
        label: `${DASHBOARD_KPI.meanLabel} (${insights.focusYear})`,
        value: `${mean.toFixed(1)}${DASHBOARD_KPI.unitPercent}`,
        hint: DASHBOARD_KPI.meanHint,
        tone: "neutral",
      },
      {
        label: DASHBOARD_KPI.tinggiShareLabel,
        value: `${share(focus?.tinggi ?? 0, regionCount)}${DASHBOARD_KPI.unitPercent}`,
        hint: DASHBOARD_KPI.tinggiShareHint,
        tone: "neutral",
      },
      {
        label: DASHBOARD_KPI.sedangShareLabel,
        value: `${share(focus?.sedang ?? 0, regionCount)}${DASHBOARD_KPI.unitPercent}`,
        hint: DASHBOARD_KPI.sedangShareHint,
        tone: "neutral",
      },
      {
        label: DASHBOARD_KPI.rendahShareLabel,
        value: `${share(focus?.rendah ?? 0, regionCount)}${DASHBOARD_KPI.unitPercent}`,
        hint: DASHBOARD_KPI.rendahShareHint,
        tone: "neutral",
      },
    ];
  }, [dataset, year]);

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <li key={tile.label} className="h-full">
          <StatCard {...tile} />
        </li>
      ))}
    </ul>
  );
}
