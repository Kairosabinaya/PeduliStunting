/**
 * Pure helpers that turn DTOs from the application layer into the shape the
 * client {@link MapViewer} needs. Kept framework-free so they can be unit
 * tested without rendering.
 */

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionBoundaryDto,
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";

import { CATEGORY_ORDER, type MapSource } from "@/config/map";

export interface MapFeature {
  readonly kodeBps: string;
  readonly geometry: unknown;
  readonly region: RegionDto;
  readonly observedCategory: StuntingCategory | null;
  readonly observedPrevalence: number | null;
  readonly predictedCategory: StuntingCategory | null;
}

export interface MapDatasetInput {
  readonly regions: readonly RegionDto[];
  readonly boundaries: readonly RegionBoundaryDto[];
  readonly indicators: readonly RegionIndicatorsDto[];
  readonly predictions: readonly ModelPredictionDto[];
}

/**
 * Join the four DTO streams by `kode_bps` so the viewer can render and
 * filter without any further lookup. Regions without a boundary are dropped
 * because the map cannot place them; everything else is preserved with
 * `null` slots so the detail panel can show "data tidak tersedia".
 *
 * Dedup rationale: the 2022 Papua pemekaran re-numbered ~26 kabupaten/kota
 * (Sorong Selatan moved from BPS 9106 → 9201, Merauke from 9401 → 9501,
 * etc.). The dataset records old-coded rows for 2021–2022 and new-coded
 * rows for 2023–2024 — both pointing at the same physical polygon. After
 * the boundary backfill (scripts/backfill-papua-boundaries.ts) both codes
 * also share a geometry. Rendered naively, the duplicates stack and
 * z-fight: whichever paints last wins, and one of them is always grey
 * because it lacks data for the active year.
 *
 * Solution: group features by (kabupaten_kota, tipe). Within each group,
 * prefer the one with non-null `observedCategory` (data exists for the
 * active year). If none has data, keep the first arbitrarily so the panel
 * still works when the user clicks it.
 */
export function buildMapFeatures(
  input: MapDatasetInput,
): readonly MapFeature[] {
  const regionByKode = indexBy(input.regions, (r) => r.kodeBps);
  const indicatorByKode = indexBy(input.indicators, (i) => i.kodeBps);
  const predictionByKode = indexBy(input.predictions, (p) => p.kodeBps);

  const byPhysicalKey = new Map<string, MapFeature>();
  for (const boundary of input.boundaries) {
    const region = regionByKode.get(boundary.kodeBps);
    if (!region) continue;
    const indicator = indicatorByKode.get(boundary.kodeBps);
    const prediction = predictionByKode.get(boundary.kodeBps);
    const feature: MapFeature = {
      kodeBps: boundary.kodeBps,
      geometry: boundary.geometry,
      region,
      observedCategory: indicator?.yCategory ?? null,
      observedPrevalence: indicator?.y1Prevalence ?? null,
      predictedCategory: prediction?.predictedCategory ?? null,
    };
    const key = physicalKey(region);
    const incumbent = byPhysicalKey.get(key);
    if (!incumbent) {
      byPhysicalKey.set(key, feature);
      continue;
    }
    if (
      incumbent.observedCategory === null &&
      feature.observedCategory !== null
    ) {
      byPhysicalKey.set(key, feature);
    }
  }
  return [...byPhysicalKey.values()];
}

function physicalKey(region: RegionDto): string {
  return `${region.tipe}|${region.kabupatenKota.trim().toLowerCase()}`;
}

export function categoryForSource(
  feature: MapFeature,
  source: MapSource,
): StuntingCategory | null {
  return source === "predicted"
    ? feature.predictedCategory
    : feature.observedCategory;
}

export function countByCategory(
  features: readonly MapFeature[],
  source: MapSource,
): Readonly<Record<StuntingCategory | "tidak-tersedia", number>> {
  const counts = { Rendah: 0, Sedang: 0, Tinggi: 0, "tidak-tersedia": 0 };
  for (const feature of features) {
    const category = categoryForSource(feature, source);
    if (category === null) {
      counts["tidak-tersedia"] += 1;
    } else {
      counts[category] += 1;
    }
  }
  return counts;
}

export interface CategoryDistributionSlice {
  readonly category: StuntingCategory;
  readonly count: number;
  readonly percent: number; // 0..100, two-decimal rounded
}

export interface RegionalSummary {
  readonly total: number;
  readonly withData: number;
  readonly averagePrevalence: number | null;
  readonly distribution: readonly CategoryDistributionSlice[];
}

/**
 * Aggregate observed indicators for the active year into a national snapshot.
 *
 * Why not compute this inside a use case? The indicators are already fetched
 * by the page for the choropleth, so deriving the summary in-process avoids a
 * second DB round-trip. Pure function → easy to unit test.
 */
export function computeRegionalSummary(
  indicators: readonly RegionIndicatorsDto[],
): RegionalSummary {
  let prevalenceSum = 0;
  let prevalenceCount = 0;
  const tally: Record<StuntingCategory, number> = {
    Rendah: 0,
    Sedang: 0,
    Tinggi: 0,
  };
  for (const row of indicators) {
    if (
      typeof row.y1Prevalence === "number" &&
      !Number.isNaN(row.y1Prevalence)
    ) {
      prevalenceSum += row.y1Prevalence;
      prevalenceCount += 1;
    }
    if (row.yCategory in tally) {
      tally[row.yCategory] += 1;
    }
  }
  const total = indicators.length;
  const denom = total > 0 ? total : 1; // avoid divide-by-zero; percent stays 0.
  const distribution: CategoryDistributionSlice[] = CATEGORY_ORDER.map(
    (category) => {
      const count = tally[category];
      return {
        category,
        count,
        percent: total > 0 ? roundTwo((count / denom) * 100) : 0,
      };
    },
  );
  return {
    total,
    withData: prevalenceCount,
    averagePrevalence:
      prevalenceCount > 0 ? roundTwo(prevalenceSum / prevalenceCount) : null,
    distribution,
  };
}

export interface RegionRanking {
  readonly rank: number;
  readonly total: number;
}

/**
 * Return the 1-indexed rank of a region by `y1_prevalence` (descending) for
 * the active year, plus the total number of ranked regions. Regions without a
 * prevalence value are excluded from the ranking.
 */
export function rankRegionByPrevalence(
  indicators: readonly RegionIndicatorsDto[],
  kodeBps: string,
): RegionRanking | null {
  const sorted = [...indicators]
    .filter(
      (row): row is RegionIndicatorsDto & { y1Prevalence: number } =>
        typeof row.y1Prevalence === "number" && !Number.isNaN(row.y1Prevalence),
    )
    .sort((a, b) => b.y1Prevalence - a.y1Prevalence);
  const idx = sorted.findIndex((row) => row.kodeBps === kodeBps);
  if (idx < 0) return null;
  return { rank: idx + 1, total: sorted.length };
}

export interface YearlyRow {
  readonly tahun: number;
  readonly observed: RegionIndicatorsDto | null;
  readonly predicted: ModelPredictionDto | null;
}

/**
 * Combine the observed and predicted history rows for a single region into a
 * year-keyed table. The output is sorted ascending by year so charts and
 * tables can iterate without a second pass.
 */
export function mergeYearlyRows(
  observed: readonly RegionIndicatorsDto[],
  predicted: readonly ModelPredictionDto[],
): readonly YearlyRow[] {
  const byYear = new Map<
    number,
    { observed?: RegionIndicatorsDto; predicted?: ModelPredictionDto }
  >();
  for (const row of observed) {
    const entry = byYear.get(row.tahun) ?? {};
    entry.observed = row;
    byYear.set(row.tahun, entry);
  }
  for (const row of predicted) {
    const entry = byYear.get(row.tahun) ?? {};
    entry.predicted = row;
    byYear.set(row.tahun, entry);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([tahun, slots]) => ({
      tahun,
      observed: slots.observed ?? null,
      predicted: slots.predicted ?? null,
    }));
}

import type { Feature, FeatureCollection, Geometry } from "geojson";

export interface MapFeatureProperties {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly tipe: "Kabupaten" | "Kota";
  readonly actualCategory: StuntingCategory | null;
  readonly predictedCategory: StuntingCategory | null;
  /** Observed `y1_prevalence` (percent 0..100) or null when missing for the active year. */
  readonly prevalence: number | null;
}

/**
 * Convert the joined map features into a GeoJSON FeatureCollection ready for
 * MapLibre. Properties carry only the fields the renderer needs — keeping the
 * client payload trim. `kodeBps` is duplicated into the geometry-level
 * properties because MapLibre's expression language reads from there, while
 * feature `id` powers `feature-state` (hover).
 */
export function toFeatureCollection(
  features: readonly MapFeature[],
): FeatureCollection<Geometry, MapFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: features.map(
      (feature): Feature<Geometry, MapFeatureProperties> => ({
        type: "Feature",
        id: feature.kodeBps,
        geometry: feature.geometry as Geometry,
        properties: {
          kodeBps: feature.kodeBps,
          kabupatenKota: feature.region.kabupatenKota,
          provinsi: feature.region.provinsi,
          tipe: feature.region.tipe,
          actualCategory: feature.observedCategory,
          predictedCategory: feature.predictedCategory,
          prevalence: feature.observedPrevalence,
        },
      }),
    ),
  };
}

/**
 * For pemekaran regions (e.g. Jayawijaya at BPS 9701 since 2022) the user can
 * still have `?wilayah=9701` selected when they switch to a year that
 * predates the split (2021). In that snapshot there is no observation for
 * 9701 — the historically correct row lives under the old code (e.g. 9402
 * under Papua province). This helper finds that sibling so the detail panel
 * can fall back to historically accurate provinsi + indicator values
 * instead of showing an anachronistic "Papua Pegunungan / Data tidak
 * tersedia" combination.
 *
 * Matching is by exact (kabupaten_kota, tipe) — kab/kota names are stable
 * across the 2022 reorg even when codes change.
 */
export function findSiblingWithDataForYear(
  selected: RegionDto,
  regions: readonly RegionDto[],
  indicators: readonly RegionIndicatorsDto[],
): RegionDto | null {
  const name = selected.kabupatenKota.trim().toLowerCase();
  for (const r of regions) {
    if (r.kodeBps === selected.kodeBps) continue;
    if (r.tipe !== selected.tipe) continue;
    if (r.kabupatenKota.trim().toLowerCase() !== name) continue;
    if (indicators.some((i) => i.kodeBps === r.kodeBps)) return r;
  }
  return null;
}

function indexBy<T, K>(items: readonly T[], getKey: (item: T) => K): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of items) {
    map.set(getKey(item), item);
  }
  return map;
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
