import type { RegionDto, RegionIndicatorsDto } from "./dtos";

/** Cross-region statistics for one year. */
export interface InsightYearStat {
  readonly tahun: number;
  /** Mean of per-region prevalence (every region weighted equally). */
  readonly meanPrevalence: number;
  readonly regionCount: number;
  readonly rendah: number;
  readonly sedang: number;
  readonly tinggi: number;
}

/** A region's prevalence ranking entry for the focus year. */
export interface RegionRankEntry {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly prevalence: number;
  readonly category: "Rendah" | "Sedang" | "Tinggi";
}

/** A province's mean-prevalence ranking entry for the focus year. */
export interface ProvinceRankEntry {
  readonly provinsi: string;
  readonly meanPrevalence: number;
  readonly regionCount: number;
}

export interface DashboardInsightsDto {
  readonly years: readonly number[];
  readonly focusYear: number;
  readonly perYear: readonly InsightYearStat[];
  readonly bestRegions: readonly RegionRankEntry[];
  readonly worstRegions: readonly RegionRankEntry[];
  readonly bestProvinces: readonly ProvinceRankEntry[];
  readonly worstProvinces: readonly ProvinceRankEntry[];
}

export interface InsightYearGroup {
  readonly tahun: number;
  readonly rows: readonly RegionIndicatorsDto[];
}

export interface InsightOptions {
  readonly rankingLimit: number;
  readonly provinceLimit: number;
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function yearStat(group: InsightYearGroup): InsightYearStat {
  const prevalences: number[] = [];
  let rendah = 0;
  let sedang = 0;
  let tinggi = 0;
  for (const row of group.rows) {
    if (typeof row.y1Prevalence === "number")
      prevalences.push(row.y1Prevalence);
    if (row.yCategory === "Rendah") rendah += 1;
    else if (row.yCategory === "Sedang") sedang += 1;
    else tinggi += 1;
  }
  return {
    tahun: group.tahun,
    meanPrevalence: round(mean(prevalences), 2),
    regionCount: group.rows.length,
    rendah,
    sedang,
    tinggi,
  };
}

/**
 * Aggregate region indicators into the dashboard insight dataset: per-year
 * cross-region means + class counts, plus best/worst region and province
 * rankings for the latest (focus) year. Pure — no IO. Rows without a numeric
 * prevalence are excluded from means and rankings, never fabricated.
 */
export function buildDashboardInsights(
  regions: readonly RegionDto[],
  indicatorsByYear: readonly InsightYearGroup[],
  options: InsightOptions,
): DashboardInsightsDto {
  const sortedGroups = [...indicatorsByYear].sort((a, b) => a.tahun - b.tahun);
  const perYear = sortedGroups.map(yearStat);
  const years = sortedGroups.map((g) => g.tahun);
  const focusYear = years.length > 0 ? Math.max(...years) : 0;

  const regionMeta = new Map<string, RegionDto>();
  for (const region of regions) regionMeta.set(region.kodeBps, region);

  const focusGroup = sortedGroups.find((g) => g.tahun === focusYear);
  const focusRows = focusGroup?.rows ?? [];

  const regionEntries: RegionRankEntry[] = [];
  const provinceBuckets = new Map<string, number[]>();
  for (const row of focusRows) {
    if (typeof row.y1Prevalence !== "number") continue;
    const meta = regionMeta.get(row.kodeBps);
    regionEntries.push({
      kodeBps: row.kodeBps,
      kabupatenKota: meta?.kabupatenKota ?? row.kodeBps,
      provinsi: meta?.provinsi ?? "-",
      prevalence: row.y1Prevalence,
      category: row.yCategory,
    });
    const provinsi = meta?.provinsi ?? "-";
    const bucket = provinceBuckets.get(provinsi);
    if (bucket) bucket.push(row.y1Prevalence);
    else provinceBuckets.set(provinsi, [row.y1Prevalence]);
  }

  const ascending = [...regionEntries].sort(
    (a, b) => a.prevalence - b.prevalence,
  );
  const provinceEntries: ProvinceRankEntry[] = [...provinceBuckets.entries()]
    .map(([provinsi, values]) => ({
      provinsi,
      meanPrevalence: round(mean(values), 2),
      regionCount: values.length,
    }))
    .sort((a, b) => a.meanPrevalence - b.meanPrevalence);

  return {
    years,
    focusYear,
    perYear,
    bestRegions: ascending.slice(0, options.rankingLimit),
    worstRegions: ascending.slice(-options.rankingLimit).reverse(),
    bestProvinces: provinceEntries.slice(0, options.provinceLimit),
    worstProvinces: provinceEntries.slice(-options.provinceLimit).reverse(),
  };
}
