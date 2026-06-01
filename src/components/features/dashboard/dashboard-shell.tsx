"use client";

// Client composition root for the cross-filtered dashboard. The title + filter
// block is sticky (only the KPI cards downward scroll); every section reacts to
// year/region changes with no server round-trip.

import Link from "next/link";
import { useMemo, useState } from "react";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { buttonVariants } from "@/components/primitives/button";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeader } from "@/components/primitives/page-header";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import {
  DASHBOARD_ANALYSIS,
  DASHBOARD_CHOROPLETH,
  DASHBOARD_RANKINGS,
  DATA_HEADER,
} from "@/config/dashboard";
import { CATEGORY_BG_CLASS, CATEGORY_ORDER } from "@/config/map";
import type { SupportedYear } from "@/config/years";
import { cn } from "@/lib/cn";

import {
  DashboardChoroplethInteractive,
  type ChoroplethGeometry,
} from "./dashboard-choropleth-interactive";
import {
  DashboardFilterProvider,
  useDashboardFilter,
} from "./dashboard-filter-context";
import { selectInsightsForYear } from "./dashboard-selectors";
import { GlobalFilterBar } from "./global-filter-bar";
import { KpiCards } from "./kpi-cards";
import { PredictorDivergingChart } from "./predictor-diverging-chart";
import { RegionRankings, type RankingScope } from "./region-rankings";
import { RegionSpotlightCard } from "./region-spotlight-card";
import { SectionHeading } from "./section-heading";
import { TipeGapCard } from "./tipe-gap-card";
import { TrendSection } from "./trend-section";

export interface DashboardShellProps {
  readonly dataset: DashboardDatasetDto;
  readonly geometry: ChoroplethGeometry;
  readonly initialYear: SupportedYear;
  readonly initialKodeBps: string | null;
}

export function DashboardShell({
  dataset,
  geometry,
  initialYear,
  initialKodeBps,
}: DashboardShellProps) {
  return (
    <DashboardFilterProvider
      initialYear={initialYear}
      initialKodeBps={initialKodeBps}
    >
      <PageHeader
        eyebrow={DATA_HEADER.eyebrow}
        title={DATA_HEADER.title}
        description={DATA_HEADER.description}
        actions={<GlobalFilterBar regions={dataset.regions} />}
      />

      <div className="space-y-5 pt-1">
        <KpiCards dataset={dataset} />
        <RegionSpotlightCard dataset={dataset} />
        <TrendRow dataset={dataset} />
        <MapSection dataset={dataset} geometry={geometry} />
        <RankingsSection dataset={dataset} />
        <PredictorSection dataset={dataset} />
      </div>
    </DashboardFilterProvider>
  );
}

function TrendRow({ dataset }: { readonly dataset: DashboardDatasetDto }) {
  const { year } = useDashboardFilter();
  const tipeData = useMemo(() => {
    const insights = selectInsightsForYear(dataset, year);
    const kotaStat = insights.trendByTipe?.Kota.find((s) => s.tahun === year);
    const kabStat = insights.trendByTipe?.Kabupaten.find(
      (s) => s.tahun === year,
    );
    return {
      kota: kotaStat
        ? {
            label: "Kota",
            rendah: kotaStat.rendah,
            sedang: kotaStat.sedang,
            tinggi: kotaStat.tinggi,
            regionCount: kotaStat.regionCount,
          }
        : undefined,
      kabupaten: kabStat
        ? {
            label: "Kabupaten",
            rendah: kabStat.rendah,
            sedang: kabStat.sedang,
            tinggi: kabStat.tinggi,
            regionCount: kabStat.regionCount,
          }
        : undefined,
    };
  }, [dataset, year]);

  return (
    <div className="grid gap-4 lg:grid-cols-4 lg:items-stretch">
      <div className="lg:col-span-3 lg:flex lg:flex-col">
        <TrendSection dataset={dataset} />
      </div>
      <div className="lg:col-span-1">
        <TipeGapCard
          year={year}
          {...(tipeData.kota ? { kota: tipeData.kota } : {})}
          {...(tipeData.kabupaten ? { kabupaten: tipeData.kabupaten } : {})}
        />
      </div>
    </div>
  );
}

function MapSection({
  dataset,
  geometry,
}: {
  readonly dataset: DashboardDatasetDto;
  readonly geometry: ChoroplethGeometry;
}) {
  return (
    <Card elevation="sm" padding="md" className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {DASHBOARD_CHOROPLETH.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {DASHBOARD_CHOROPLETH.description}
          </p>
        </div>
        <Link
          href="/map"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          {DASHBOARD_CHOROPLETH.openMapLabel}
        </Link>
      </header>
      <DashboardChoroplethInteractive geometry={geometry} dataset={dataset} />
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        {CATEGORY_ORDER.map((category) => (
          <li key={category} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn(
                "inline-block size-3 rounded-full",
                CATEGORY_BG_CLASS[category],
              )}
            />
            {category}
          </li>
        ))}
        <li className="text-muted-foreground/70">
          {DASHBOARD_CHOROPLETH.selectHint}
        </li>
      </ul>
    </Card>
  );
}

function RankingsSection({
  dataset,
}: {
  readonly dataset: DashboardDatasetDto;
}) {
  const { year, selectedKodeBps } = useDashboardFilter();
  const [scope, setScope] = useState<RankingScope>("region");
  const insights = useMemo(
    () => selectInsightsForYear(dataset, year),
    [dataset, year],
  );
  const scopeItems: readonly SegmentedControlItem<RankingScope>[] = [
    { id: "region", label: DASHBOARD_RANKINGS.regionScope },
    { id: "province", label: DASHBOARD_RANKINGS.provinceScope },
  ];
  return (
    <section className="space-y-3">
      <SectionHeading
        as="h2"
        title={DASHBOARD_RANKINGS.title}
        description={DASHBOARD_RANKINGS.description}
        trailing={
          <SegmentedControl
            ariaLabel={DASHBOARD_RANKINGS.scopeAriaLabel}
            value={scope}
            onValueChange={setScope}
            items={scopeItems}
          />
        }
      />
      <RegionRankings
        insights={insights}
        scope={scope}
        {...(selectedKodeBps ? { highlightKodeBps: selectedKodeBps } : {})}
      />
    </section>
  );
}

function PredictorSection({
  dataset,
}: {
  readonly dataset: DashboardDatasetDto;
}) {
  if (dataset.predictors.length === 0) {
    return (
      <EmptyState
        title={DASHBOARD_ANALYSIS.emptyTitle}
        description={DASHBOARD_ANALYSIS.emptyDescription}
      />
    );
  }
  return (
    <Card elevation="sm" padding="md" className="space-y-4">
      <header>
        <h2 className="text-base font-semibold text-foreground">
          {DASHBOARD_ANALYSIS.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {DASHBOARD_ANALYSIS.correlationHint}
        </p>
      </header>
      <PredictorDivergingChart predictors={dataset.predictors} />
    </Card>
  );
}
