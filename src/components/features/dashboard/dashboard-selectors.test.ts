import { describe, expect, it } from "vitest";

import { buildDashboardDataset } from "@/application/region/dashboard-dataset";
import { buildDashboardInsights } from "@/application/region/insights";
import type {
  IndicatorDefinitionDto,
  RegionDto,
} from "@/application/region/dtos";
import type { InsightYearGroup } from "@/application/region/insights";
import { DASHBOARD_INSIGHTS } from "@/config/dashboard";

import {
  selectInsightsForYear,
  selectNationalTrendPoints,
  selectRegionRank,
  selectRegionTrendPoints,
  toInsightInputs,
} from "./dashboard-selectors";

function region(
  kodeBps: string,
  kabupatenKota: string,
  provinsi: string,
  tipe: "Kabupaten" | "Kota" = "Kabupaten",
): RegionDto {
  return {
    kodeBps,
    provinsi,
    kabupatenKota,
    tipe,
    latitude: null,
    longitude: null,
  };
}

function indicator(
  kodeBps: string,
  tahun: number,
  y1Prevalence: number | null,
  yCategory: "Rendah" | "Sedang" | "Tinggi",
) {
  return { kodeBps, tahun, yCategory, y1Prevalence, predictors: {} };
}

const REGIONS: readonly RegionDto[] = [
  region("1101", "Alpha", "Aceh"),
  region("3201", "Charlie", "Jawa Barat", "Kota"),
];

const GROUPS: readonly InsightYearGroup[] = [
  {
    tahun: 2023,
    rows: [
      indicator("1101", 2023, 30, "Tinggi"),
      indicator("3201", 2023, 10, "Rendah"),
    ],
  },
  {
    tahun: 2024,
    rows: [
      indicator("1101", 2024, 28, "Sedang"),
      indicator("3201", 2024, 8, "Rendah"),
    ],
  },
];

const PREDICTORS: readonly IndicatorDefinitionDto[] = [];

const NATIONAL = [
  { tahun: 2023, prevalence: 21.5 },
  { tahun: 2024, prevalence: 19.8 },
];

const DATASET = buildDashboardDataset(REGIONS, GROUPS, PREDICTORS, NATIONAL);
const OPTIONS = {
  rankingLimit: DASHBOARD_INSIGHTS.rankingLimit,
  provinceLimit: DASHBOARD_INSIGHTS.provinceLimit,
  moverLimit: DASHBOARD_INSIGHTS.moverLimit,
};

describe("dashboard-selectors", () => {
  it("toInsightInputs reconstructs one group per year with rows", () => {
    const { regions, groups } = toInsightInputs(DATASET);
    expect(regions).toHaveLength(2);
    expect(groups.map((g) => g.tahun)).toEqual([2023, 2024]);
    const y2024 = groups.find((g) => g.tahun === 2024);
    expect(y2024?.rows).toHaveLength(2);
  });

  it("selectInsightsForYear matches the server-side aggregator (parity)", () => {
    const fromDataset = selectInsightsForYear(DATASET, 2024);
    const fromServer = buildDashboardInsights(REGIONS, GROUPS, OPTIONS, 2024);
    expect(fromDataset.focusYear).toBe(fromServer.focusYear);
    expect(fromDataset.perYear).toEqual(fromServer.perYear);
    expect(fromDataset.bestRegions.map((r) => r.kodeBps)).toEqual(
      fromServer.bestRegions.map((r) => r.kodeBps),
    );
    expect(fromDataset.worstRegions.map((r) => r.kodeBps)).toEqual(
      fromServer.worstRegions.map((r) => r.kodeBps),
    );
  });

  it("selectInsightsForYear follows the requested year", () => {
    expect(selectInsightsForYear(DATASET, 2023).focusYear).toBe(2023);
    expect(selectInsightsForYear(DATASET, 2024).focusYear).toBe(2024);
  });

  it("selectRegionRank ranks ascending by prevalence (1 = lowest)", () => {
    expect(selectRegionRank(DATASET, 2024, "3201")).toEqual({
      rank: 1,
      total: 2,
    });
    expect(selectRegionRank(DATASET, 2024, "1101")).toEqual({
      rank: 2,
      total: 2,
    });
    expect(selectRegionRank(DATASET, 2024, "9999")).toBeNull();
  });

  it("selectRegionTrendPoints returns one point per year", () => {
    expect(selectRegionTrendPoints(DATASET, "1101")).toEqual([
      { tahun: 2023, prevalence: 30 },
      { tahun: 2024, prevalence: 28 },
    ]);
  });

  it("selectNationalTrendPoints pairs cross-region mean with national figure", () => {
    const points = selectNationalTrendPoints(DATASET);
    const y2024 = points.find((p) => p.tahun === 2024);
    expect(y2024).toEqual({ tahun: 2024, crossRegion: 18, national: 19.8 });
  });
});
