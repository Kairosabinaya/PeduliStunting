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

/** Focus-year mean prevalence split by region type (Kabupaten vs Kota). */
export interface TipeStat {
  readonly meanPrevalence: number;
  readonly regionCount: number;
}

/**
 * One region's prevalence change between the two latest years. `change` is
 * `focusPrevalence - priorPrevalence`; negative means stunting fell (an
 * improvement), positive means it rose (a worsening).
 */
export interface RegionYearChangeEntry {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly priorPrevalence: number;
  readonly focusPrevalence: number;
  readonly change: number;
}

export interface DashboardInsightsDto {
  readonly years: readonly number[];
  readonly focusYear: number;
  readonly perYear: readonly InsightYearStat[];
  readonly bestRegions: readonly RegionRankEntry[];
  readonly worstRegions: readonly RegionRankEntry[];
  readonly bestProvinces: readonly ProvinceRankEntry[];
  readonly worstProvinces: readonly ProvinceRankEntry[];
  /** Focus-year mean split by region type. Omitted for an empty dataset. */
  readonly tipeStats?: {
    readonly kabupaten: TipeStat;
    readonly kota: TipeStat;
  };
  /**
   * Largest prevalence movers between the two latest years. `improvements` are
   * sorted most-improved first (most negative change); `declines` most-worsened
   * first. Omitted when fewer than two years are available.
   */
  readonly biggestMovers?: {
    readonly improvements: readonly RegionYearChangeEntry[];
    readonly declines: readonly RegionYearChangeEntry[];
  };
  /** Per-year cross-region stats split by region type. Omitted when empty. */
  readonly trendByTipe?: {
    readonly Kabupaten: readonly InsightYearStat[];
    readonly Kota: readonly InsightYearStat[];
  };
}

export interface InsightYearGroup {
  readonly tahun: number;
  readonly rows: readonly RegionIndicatorsDto[];
}

export interface InsightOptions {
  readonly rankingLimit: number;
  readonly provinceLimit: number;
  readonly moverLimit: number;
}

type RegionType = "Kabupaten" | "Kota";

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
 * rankings for the focus year. Pure — no IO. Rows without a numeric prevalence
 * are excluded from means and rankings, never fabricated.
 *
 * `targetYear` selects which year the rankings, tipe split, and movers describe.
 * When omitted (or not present in the dataset) it defaults to the latest year,
 * preserving the original behaviour. The cross-filtered dashboard passes the
 * user-selected year so every derived view follows the filter without an extra
 * server round-trip.
 */
export function buildDashboardInsights(
  regions: readonly RegionDto[],
  indicatorsByYear: readonly InsightYearGroup[],
  options: InsightOptions,
  targetYear?: number,
): DashboardInsightsDto {
  const sortedGroups = [...indicatorsByYear].sort((a, b) => a.tahun - b.tahun);
  const perYear = sortedGroups.map(yearStat);
  const years = sortedGroups.map((g) => g.tahun);
  const latestYear = years.length > 0 ? Math.max(...years) : 0;
  const focusYear =
    targetYear !== undefined && years.includes(targetYear)
      ? targetYear
      : latestYear;

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

  const hasData = years.length > 0;

  // Focus-year mean split by region type (Kabupaten vs Kota).
  const prevalenceByTipe = (target: RegionType): number[] =>
    focusRows
      .filter(
        (row) =>
          typeof row.y1Prevalence === "number" &&
          regionMeta.get(row.kodeBps)?.tipe === target,
      )
      .map((row) => row.y1Prevalence as number);
  const kabValues = prevalenceByTipe("Kabupaten");
  const kotaValues = prevalenceByTipe("Kota");
  const tipeStats = hasData
    ? {
        kabupaten: {
          meanPrevalence: round(mean(kabValues), 2),
          regionCount: kabValues.length,
        },
        kota: {
          meanPrevalence: round(mean(kotaValues), 2),
          regionCount: kotaValues.length,
        },
      }
    : undefined;

  // Per-year cross-region stats split by region type (filtered rows only; the
  // shared `perYear` path above is untouched).
  const trendOf = (target: RegionType): InsightYearStat[] =>
    sortedGroups.map((group) =>
      yearStat({
        tahun: group.tahun,
        rows: group.rows.filter(
          (row) => regionMeta.get(row.kodeBps)?.tipe === target,
        ),
      }),
    );
  const trendByTipe = hasData
    ? { Kabupaten: trendOf("Kabupaten"), Kota: trendOf("Kota") }
    : undefined;

  // Largest prevalence movers between the focus year and its prior year. The
  // prior year is the one immediately before the focus year in the sorted set,
  // so movers follow `targetYear` rather than always comparing the two latest.
  let biggestMovers:
    | {
        readonly improvements: readonly RegionYearChangeEntry[];
        readonly declines: readonly RegionYearChangeEntry[];
      }
    | undefined;
  const focusIndex = years.indexOf(focusYear);
  const priorYear = focusIndex > 0 ? years[focusIndex - 1] : undefined;
  if (priorYear !== undefined) {
    const priorGroup = sortedGroups.find((g) => g.tahun === priorYear);
    const priorByKode = new Map<string, number>();
    for (const row of priorGroup?.rows ?? []) {
      if (typeof row.y1Prevalence === "number")
        priorByKode.set(row.kodeBps, row.y1Prevalence);
    }
    const changes: RegionYearChangeEntry[] = [];
    for (const row of focusRows) {
      if (typeof row.y1Prevalence !== "number") continue;
      const prior = priorByKode.get(row.kodeBps);
      if (prior === undefined) continue;
      const meta = regionMeta.get(row.kodeBps);
      changes.push({
        kodeBps: row.kodeBps,
        kabupatenKota: meta?.kabupatenKota ?? row.kodeBps,
        provinsi: meta?.provinsi ?? "-",
        priorPrevalence: prior,
        focusPrevalence: row.y1Prevalence,
        change: round(row.y1Prevalence - prior, 2),
      });
    }
    const byChangeAsc = [...changes].sort((a, b) => a.change - b.change);
    biggestMovers = {
      improvements: byChangeAsc
        .filter((e) => e.change < 0)
        .slice(0, options.moverLimit),
      declines: byChangeAsc
        .filter((e) => e.change > 0)
        .reverse()
        .slice(0, options.moverLimit),
    };
  }

  return {
    years,
    focusYear,
    perYear,
    bestRegions: ascending.slice(0, options.rankingLimit),
    worstRegions: ascending.slice(-options.rankingLimit).reverse(),
    bestProvinces: provinceEntries.slice(0, options.provinceLimit),
    worstProvinces: provinceEntries.slice(-options.provinceLimit).reverse(),
    ...(tipeStats ? { tipeStats } : {}),
    ...(trendByTipe ? { trendByTipe } : {}),
    ...(biggestMovers ? { biggestMovers } : {}),
  };
}
