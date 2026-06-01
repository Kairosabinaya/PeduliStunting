import { describe, expect, it } from "vitest";

import {
  buildDashboardInsights,
  type InsightYearGroup,
} from "@/application/region/insights";
import type { RegionDto, RegionIndicatorsDto } from "@/application/region/dtos";

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
): RegionIndicatorsDto {
  return { kodeBps, tahun, yCategory, y1Prevalence, predictors: {} };
}

const REGIONS: readonly RegionDto[] = [
  region("1101", "Alpha", "Aceh"),
  region("1102", "Bravo", "Aceh"),
  region("3201", "Charlie", "Jawa Barat", "Kota"),
];

const GROUPS: readonly InsightYearGroup[] = [
  {
    tahun: 2023,
    rows: [
      indicator("1101", 2023, 30, "Tinggi"),
      indicator("1102", 2023, 20, "Sedang"),
      indicator("3201", 2023, 10, "Rendah"),
    ],
  },
  {
    tahun: 2024,
    rows: [
      indicator("1101", 2024, 28, "Sedang"),
      indicator("1102", 2024, 18, "Rendah"),
      indicator("3201", 2024, 8, "Rendah"),
    ],
  },
];

const OPTIONS = { rankingLimit: 2, provinceLimit: 2, moverLimit: 2 };

describe("buildDashboardInsights", () => {
  it("should compute cross-region means and class counts per year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS);
    const y2024 = result.perYear.find((p) => p.tahun === 2024);
    expect(y2024?.meanPrevalence).toBeCloseTo(18, 5);
    expect(y2024?.regionCount).toBe(3);
    expect(y2024).toMatchObject({ rendah: 2, sedang: 1, tinggi: 0 });
  });

  it("should pick the latest year as the focus year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS);
    expect(result.focusYear).toBe(2024);
    expect(result.years).toEqual([2023, 2024]);
  });

  it("should rank regions best (lowest) and worst (highest) for the focus year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS);
    expect(result.bestRegions.map((r) => r.kodeBps)).toEqual(["3201", "1102"]);
    expect(result.worstRegions.map((r) => r.kodeBps)).toEqual(["1101", "1102"]);
    expect(result.bestRegions[0]?.kabupatenKota).toBe("Charlie");
  });

  it("should aggregate provinces by mean prevalence for the focus year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS);
    // Aceh focus-year mean = (28 + 18) / 2 = 23; Jawa Barat = 8.
    expect(result.bestProvinces[0]).toMatchObject({
      provinsi: "Jawa Barat",
      meanPrevalence: 8,
      regionCount: 1,
    });
    expect(result.worstProvinces[0]).toMatchObject({
      provinsi: "Aceh",
      meanPrevalence: 23,
    });
  });

  it("should exclude rows without a numeric prevalence from means and rankings", () => {
    const groups: readonly InsightYearGroup[] = [
      {
        tahun: 2024,
        rows: [
          indicator("1101", 2024, null, "Sedang"),
          indicator("1102", 2024, 12, "Rendah"),
        ],
      },
    ];
    const result = buildDashboardInsights(REGIONS, groups, OPTIONS);
    expect(result.perYear[0]?.meanPrevalence).toBe(12);
    expect(result.bestRegions).toHaveLength(1);
    expect(result.bestRegions[0]?.kodeBps).toBe("1102");
  });

  it("should return zeroed focus year for an empty dataset", () => {
    const result = buildDashboardInsights([], [], OPTIONS);
    expect(result.focusYear).toBe(0);
    expect(result.perYear).toEqual([]);
    expect(result.bestRegions).toEqual([]);
    expect(result.tipeStats).toBeUndefined();
    expect(result.biggestMovers).toBeUndefined();
    expect(result.trendByTipe).toBeUndefined();
  });

  it("should split the focus-year mean by region type", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS);
    // 2024: Kabupaten = [28, 18] mean 23; Kota = [8] mean 8.
    expect(result.tipeStats?.kabupaten).toMatchObject({
      meanPrevalence: 23,
      regionCount: 2,
    });
    expect(result.tipeStats?.kota).toMatchObject({
      meanPrevalence: 8,
      regionCount: 1,
    });
  });

  it("should produce per-year trends split by region type", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS);
    const kab2024 = result.trendByTipe?.Kabupaten.find((p) => p.tahun === 2024);
    const kota2024 = result.trendByTipe?.Kota.find((p) => p.tahun === 2024);
    expect(kab2024).toMatchObject({ meanPrevalence: 23, regionCount: 2 });
    expect(kota2024).toMatchObject({ meanPrevalence: 8, regionCount: 1 });
  });

  it("should rank for the requested target year instead of the latest", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS, 2023);
    expect(result.focusYear).toBe(2023);
    expect(result.years).toEqual([2023, 2024]);
    expect(result.bestRegions.map((r) => r.kodeBps)).toEqual(["3201", "1102"]);
    expect(result.worstRegions.map((r) => r.kodeBps)).toEqual(["1101", "1102"]);
    expect(result.bestRegions[0]?.prevalence).toBe(10);
  });

  it("should split tipe stats by the target year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS, 2023);
    // 2023: Kabupaten = [30, 20] mean 25; Kota = [10] mean 10.
    expect(result.tipeStats?.kabupaten).toMatchObject({
      meanPrevalence: 25,
      regionCount: 2,
    });
    expect(result.tipeStats?.kota).toMatchObject({
      meanPrevalence: 10,
      regionCount: 1,
    });
  });

  it("should omit movers when the target year has no prior year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS, 2023);
    expect(result.biggestMovers).toBeUndefined();
  });

  it("should fall back to the latest year for an unknown target year", () => {
    const result = buildDashboardInsights(REGIONS, GROUPS, OPTIONS, 1999);
    expect(result.focusYear).toBe(2024);
  });

  it("should rank biggest improvements and declines over the two latest years", () => {
    const moverGroups: readonly InsightYearGroup[] = [
      {
        tahun: 2023,
        rows: [
          indicator("1101", 2023, 30, "Tinggi"),
          indicator("1102", 2023, 20, "Sedang"),
          indicator("3201", 2023, 10, "Rendah"),
        ],
      },
      {
        tahun: 2024,
        rows: [
          indicator("1101", 2024, 22, "Sedang"), // change -8 (improve most)
          indicator("1102", 2024, 21, "Sedang"), // change +1 (decline)
          indicator("3201", 2024, 9, "Rendah"), // change -1 (improve)
        ],
      },
    ];
    const result = buildDashboardInsights(REGIONS, moverGroups, OPTIONS);
    expect(result.biggestMovers?.improvements.map((e) => e.kodeBps)).toEqual([
      "1101",
      "3201",
    ]);
    expect(result.biggestMovers?.improvements[0]?.change).toBe(-8);
    expect(result.biggestMovers?.declines.map((e) => e.kodeBps)).toEqual([
      "1102",
    ]);
    expect(result.biggestMovers?.declines[0]).toMatchObject({
      priorPrevalence: 20,
      focusPrevalence: 21,
      change: 1,
    });
  });
});
