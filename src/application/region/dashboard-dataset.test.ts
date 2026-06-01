import { describe, expect, it } from "vitest";

import { buildDashboardDataset } from "@/application/region/dashboard-dataset";
import type {
  IndicatorDefinitionDto,
  RegionDto,
} from "@/application/region/dtos";
import type { InsightYearGroup } from "@/application/region/insights";

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

function predictor(
  code: string,
  name: string,
  corPrevalence: number | null,
  dimension = "socioeconomic",
): IndicatorDefinitionDto {
  return {
    code,
    dimension,
    name,
    description: null,
    unit: null,
    sourceLabel: null,
    sourceUrl: null,
    effectDirection:
      corPrevalence !== null && corPrevalence > 0 ? "risk" : "protective",
    model: {
      transform: null,
      stdMean: null,
      stdSd: null,
      origMin: null,
      origMax: null,
      origP5: null,
      origP50: null,
      origP95: null,
      pctActive: null,
      pctPositive: null,
      medianCoef: null,
      corPrevalence,
      modelDimension: null,
      displayOrder: null,
    },
  };
}

const REGIONS: readonly RegionDto[] = [
  region("1101", "Alpha", "Aceh"),
  region("3201", "Charlie", "Jawa Barat", "Kota"),
];

const GROUPS: readonly InsightYearGroup[] = [
  {
    tahun: 2024,
    rows: [
      indicator("1101", 2024, 28, "Sedang"),
      indicator("3201", 2024, 8, "Rendah"),
    ],
  },
  {
    tahun: 2023,
    rows: [
      indicator("1101", 2023, 30, "Tinggi"),
      indicator("3201", 2023, 10, "Rendah"),
    ],
  },
];

const PREDICTORS: readonly IndicatorDefinitionDto[] = [
  predictor("X1", "Penduduk miskin", 0.5),
  predictor("X2", "Lama sekolah", -0.38),
  predictor("X3", "Tanpa korelasi", null),
];

const NATIONAL = [
  { tahun: 2024, prevalence: 19.8 },
  { tahun: 2023, prevalence: 21.5 },
];

describe("buildDashboardDataset", () => {
  it("should sort years ascending and pick the latest as focus year", () => {
    const dataset = buildDashboardDataset(
      REGIONS,
      GROUPS,
      PREDICTORS,
      NATIONAL,
    );
    expect(dataset.years).toEqual([2023, 2024]);
    expect(dataset.focusYear).toBe(2024);
  });

  it("should build per-region byYear maps with prevalence and category", () => {
    const dataset = buildDashboardDataset(
      REGIONS,
      GROUPS,
      PREDICTORS,
      NATIONAL,
    );
    const alpha = dataset.regions.find((r) => r.kodeBps === "1101");
    expect(alpha?.kabupatenKota).toBe("Alpha");
    expect(alpha?.byYear[2024]).toEqual({ prevalence: 28, category: "Sedang" });
    expect(alpha?.byYear[2023]).toEqual({ prevalence: 30, category: "Tinggi" });
  });

  it("should drop predictors without a numeric correlation", () => {
    const dataset = buildDashboardDataset(
      REGIONS,
      GROUPS,
      PREDICTORS,
      NATIONAL,
    );
    expect(dataset.predictors.map((p) => p.code)).toEqual(["X1", "X2"]);
    expect(dataset.predictors[0]).toMatchObject({
      code: "X1",
      corPrevalence: 0.5,
      effectDirection: "risk",
    });
  });

  it("should pass national reference sorted ascending", () => {
    const dataset = buildDashboardDataset(
      REGIONS,
      GROUPS,
      PREDICTORS,
      NATIONAL,
    );
    expect(dataset.national.map((n) => n.tahun)).toEqual([2023, 2024]);
  });

  it("should yield empty region rows when a region has no indicator data", () => {
    const dataset = buildDashboardDataset(
      [region("9999", "Lonely", "Nowhere")],
      GROUPS,
      PREDICTORS,
      NATIONAL,
    );
    const lonely = dataset.regions.find((r) => r.kodeBps === "9999");
    expect(lonely?.byYear).toEqual({});
  });
});
