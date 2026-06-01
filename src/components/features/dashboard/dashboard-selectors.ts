import type {
  DashboardDatasetDto,
  DashboardRegionRow,
} from "@/application/region/dashboard-dataset";
import type { RegionDto, RegionIndicatorsDto } from "@/application/region/dtos";
import {
  buildDashboardInsights,
  type DashboardInsightsDto,
  type InsightYearGroup,
} from "@/application/region/insights";
import { DASHBOARD_INSIGHTS } from "@/config/dashboard";

/** One year of the trend chart: cross-region mean plus the national figure. */
export interface TrendPoint {
  readonly tahun: number;
  readonly crossRegion: number;
  readonly national: number | null;
}

/** One year of a single region's prevalence series. */
export interface RegionTrendPoint {
  readonly tahun: number;
  readonly prevalence: number | null;
}

/** A region's national rank for a year (1 = lowest prevalence). */
export interface RegionRank {
  readonly rank: number;
  readonly total: number;
}

const INSIGHT_OPTIONS = {
  rankingLimit: DASHBOARD_INSIGHTS.rankingLimit,
  provinceLimit: DASHBOARD_INSIGHTS.provinceLimit,
  moverLimit: DASHBOARD_INSIGHTS.moverLimit,
};

/**
 * Rebuild the `(regions, indicatorsByYear)` inputs that
 * {@link buildDashboardInsights} expects from the compact dataset, so the SAME
 * tested aggregator runs on the client — no parallel aggregation logic.
 */
export function toInsightInputs(dataset: DashboardDatasetDto): {
  readonly regions: readonly RegionDto[];
  readonly groups: readonly InsightYearGroup[];
} {
  const regions: RegionDto[] = dataset.regions.map((row) => ({
    kodeBps: row.kodeBps,
    provinsi: row.provinsi,
    kabupatenKota: row.kabupatenKota,
    tipe: row.tipe,
    latitude: null,
    longitude: null,
  }));

  const groups: InsightYearGroup[] = dataset.years.map((tahun) => {
    const rows: RegionIndicatorsDto[] = [];
    for (const region of dataset.regions) {
      const entry = region.byYear[tahun];
      if (entry === undefined) continue;
      rows.push({
        kodeBps: region.kodeBps,
        tahun,
        yCategory: entry.category,
        y1Prevalence: entry.prevalence,
        predictors: {},
      });
    }
    return { tahun, rows };
  });

  return { regions, groups };
}

/** Per-year KPIs, rankings, and distribution for the selected year. */
export function selectInsightsForYear(
  dataset: DashboardDatasetDto,
  year: number,
): DashboardInsightsDto {
  const { regions, groups } = toInsightInputs(dataset);
  return buildDashboardInsights(regions, groups, INSIGHT_OPTIONS, year);
}

/** The full multi-year row for one region, or undefined when not present. */
export function selectRegionRow(
  dataset: DashboardDatasetDto,
  kodeBps: string,
): DashboardRegionRow | undefined {
  return dataset.regions.find((row) => row.kodeBps === kodeBps);
}

/**
 * A region's national rank for a year by ascending prevalence (1 = lowest
 * stunting), matching the "best regions first" ordering used elsewhere. Returns
 * `null` when the region has no numeric prevalence that year.
 */
export function selectRegionRank(
  dataset: DashboardDatasetDto,
  year: number,
  kodeBps: string,
): RegionRank | null {
  const ranked = dataset.regions
    .flatMap((row) => {
      const prevalence = row.byYear[year]?.prevalence ?? null;
      return prevalence === null ? [] : [{ kodeBps: row.kodeBps, prevalence }];
    })
    .sort((a, b) => a.prevalence - b.prevalence);
  const index = ranked.findIndex((row) => row.kodeBps === kodeBps);
  if (index === -1) return null;
  return { rank: index + 1, total: ranked.length };
}

/** One prevalence point per available year for a single region. */
export function selectRegionTrendPoints(
  dataset: DashboardDatasetDto,
  kodeBps: string,
): readonly RegionTrendPoint[] {
  const region = selectRegionRow(dataset, kodeBps);
  return dataset.years.map((tahun) => ({
    tahun,
    prevalence: region?.byYear[tahun]?.prevalence ?? null,
  }));
}

/** Cross-region mean and national figure per year for the trend chart. */
export function selectNationalTrendPoints(
  dataset: DashboardDatasetDto,
): readonly TrendPoint[] {
  const insights = selectInsightsForYear(dataset, dataset.focusYear);
  const nationalByYear = new Map<number, number>();
  for (const point of dataset.national) {
    nationalByYear.set(point.tahun, point.prevalence);
  }
  return insights.perYear.map((stat) => ({
    tahun: stat.tahun,
    crossRegion: stat.meanPrevalence,
    national: nationalByYear.get(stat.tahun) ?? null,
  }));
}
