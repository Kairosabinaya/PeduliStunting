import type { IndicatorDefinitionDto, RegionDto } from "./dtos";
import type { InsightYearGroup } from "./insights";

/** A single region's prevalence and category for one year. */
export interface DashboardRegionYear {
  readonly prevalence: number | null;
  readonly category: "Rendah" | "Sedang" | "Tinggi";
}

/**
 * One region with its multi-year series, keyed by year. This is the compact
 * unit the client cross-filters over: every chart derives its view from these
 * rows for the selected year without a server round-trip.
 */
export interface DashboardRegionRow {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly tipe: "Kabupaten" | "Kota";
  readonly byYear: Readonly<Record<number, DashboardRegionYear>>;
}

/** A predictor's signed correlation with stunting prevalence (dataset-level). */
export interface DashboardPredictorCorrelation {
  readonly code: string;
  readonly name: string;
  readonly dimension: string;
  readonly corPrevalence: number;
  readonly effectDirection: string | null;
}

/** Population-weighted national prevalence reference for one year (config). */
export interface DashboardNationalYear {
  readonly tahun: number;
  readonly prevalence: number;
}

/**
 * Compact, client-shippable dashboard dataset. Carries the full region-year
 * prevalence matrix (small: ~514 regions x 4 years), the predictor correlation
 * ramp, and the national reference series. All per-year aggregation
 * (KPIs, rankings, distribution) is derived on the client from these rows.
 */
export interface DashboardDatasetDto {
  readonly years: readonly number[];
  readonly focusYear: number;
  readonly regions: readonly DashboardRegionRow[];
  readonly predictors: readonly DashboardPredictorCorrelation[];
  readonly national: readonly DashboardNationalYear[];
}

/**
 * Assemble the compact dashboard dataset from region metadata, region
 * indicators grouped by year, the indicator dictionary, and the national
 * reference. Pure — no IO. Predictors without a numeric correlation are
 * dropped (never fabricated); regions with no indicator rows keep an empty
 * `byYear` map so the choropleth can still render them as "no data".
 */
export function buildDashboardDataset(
  regions: readonly RegionDto[],
  indicatorsByYear: readonly InsightYearGroup[],
  predictors: readonly IndicatorDefinitionDto[],
  national: readonly DashboardNationalYear[],
): DashboardDatasetDto {
  const sortedGroups = [...indicatorsByYear].sort((a, b) => a.tahun - b.tahun);
  const years = sortedGroups.map((group) => group.tahun);
  const focusYear = years.length > 0 ? Math.max(...years) : 0;

  // kodeBps -> (year -> {prevalence, category})
  const byRegion = new Map<string, Record<number, DashboardRegionYear>>();
  for (const group of sortedGroups) {
    for (const row of group.rows) {
      let bucket = byRegion.get(row.kodeBps);
      if (bucket === undefined) {
        bucket = {};
        byRegion.set(row.kodeBps, bucket);
      }
      bucket[group.tahun] = {
        prevalence: row.y1Prevalence,
        category: row.yCategory,
      };
    }
  }

  const regionRows: DashboardRegionRow[] = regions.map((region) => ({
    kodeBps: region.kodeBps,
    kabupatenKota: region.kabupatenKota,
    provinsi: region.provinsi,
    tipe: region.tipe,
    byYear: byRegion.get(region.kodeBps) ?? {},
  }));

  const predictorRows: DashboardPredictorCorrelation[] = predictors.flatMap(
    (predictor) => {
      const cor = predictor.model.corPrevalence;
      if (cor === null) return [];
      return [
        {
          code: predictor.code,
          name: predictor.name,
          dimension: predictor.dimension,
          corPrevalence: cor,
          effectDirection: predictor.effectDirection,
        },
      ];
    },
  );

  return {
    years,
    focusYear,
    regions: regionRows,
    predictors: predictorRows,
    national: [...national].sort((a, b) => a.tahun - b.tahun),
  };
}
