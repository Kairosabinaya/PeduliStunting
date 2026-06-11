import { describe, expect, it } from "vitest";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionBoundaryDto,
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";

import {
  buildMapFeatures,
  categoryForSource,
  computeRegionalSummary,
  countByCategory,
  mergeYearlyRows,
  rankRegionByPrevalence,
  type MapFeature,
} from "./map-data";

const POLYGON = {
  type: "Polygon" as const,
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
};

const region: RegionDto = {
  kodeBps: "1101",
  provinsi: "Aceh",
  kabupatenKota: "Kab. Simeulue",
  tipe: "Kabupaten",
  latitude: 2.6,
  longitude: 96.1,
};

const orphanRegion: RegionDto = {
  ...region,
  kodeBps: "9999",
  kabupatenKota: "Tanpa Geometri",
};

const boundary: RegionBoundaryDto = {
  kodeBps: "1101",
  geometry: POLYGON,
  simplificationTolerance: 0.01,
  source: "indo_kabkota_2023.gpkg",
};

const indicator: RegionIndicatorsDto = {
  kodeBps: "1101",
  tahun: 2024,
  yCategory: "Sedang",
  y1Prevalence: 22.5,
  predictors: { X1: 1 },
};

const prediction: ModelPredictionDto = {
  modelVersion: "gtwenolr-adaptive-1.0",
  kodeBps: "1101",
  tahun: 2024,
  predictedCategory: "Tinggi",
  probRendah: 0.1,
  probSedang: 0.3,
  probTinggi: 0.6,
};

describe("buildMapFeatures", () => {
  it("joins region, boundary, indicator, and prediction by kode_bps", () => {
    const features = buildMapFeatures({
      regions: [region],
      boundaries: [boundary],
      indicators: [indicator],
      predictions: [prediction],
    });
    expect(features).toHaveLength(1);
    const [feature] = features;
    expect(feature?.kodeBps).toBe("1101");
    expect(feature?.observedCategory).toBe("Sedang");
    expect(feature?.observedPrevalence).toBe(22.5);
    expect(feature?.predictedCategory).toBe("Tinggi");
  });

  it("drops boundaries that have no matching region", () => {
    const features = buildMapFeatures({
      regions: [],
      boundaries: [boundary],
      indicators: [],
      predictions: [],
    });
    expect(features).toHaveLength(0);
  });

  it("keeps regions without indicator or prediction with null slots", () => {
    const features = buildMapFeatures({
      regions: [region],
      boundaries: [boundary],
      indicators: [],
      predictions: [],
    });
    expect(features[0]?.observedCategory).toBeNull();
    expect(features[0]?.observedPrevalence).toBeNull();
    expect(features[0]?.predictedCategory).toBeNull();
  });

  it("ignores regions that have no boundary", () => {
    const features = buildMapFeatures({
      regions: [region, orphanRegion],
      boundaries: [boundary],
      indicators: [],
      predictions: [],
    });
    expect(features.map((f) => f.kodeBps)).toEqual(["1101"]);
  });
});

describe("categoryForSource / countByCategory", () => {
  const features: readonly MapFeature[] = [
    {
      kodeBps: "1",
      geometry: POLYGON,
      region,
      observedCategory: "Rendah",
      observedPrevalence: 10,
      predictedCategory: "Sedang",
    },
    {
      kodeBps: "2",
      geometry: POLYGON,
      region,
      observedCategory: "Sedang",
      observedPrevalence: 25,
      predictedCategory: "Tinggi",
    },
    {
      kodeBps: "3",
      geometry: POLYGON,
      region,
      observedCategory: null,
      observedPrevalence: null,
      predictedCategory: "Rendah",
    },
  ];

  const [first, , third] = features;
  if (!first || !third) throw new Error("fixture missing features");

  it("returns the observed category for source=actual", () => {
    expect(categoryForSource(first, "actual")).toBe("Rendah");
    expect(categoryForSource(third, "actual")).toBeNull();
  });

  it("returns the predicted category for source=predicted", () => {
    expect(categoryForSource(first, "predicted")).toBe("Sedang");
    expect(categoryForSource(third, "predicted")).toBe("Rendah");
  });

  it("counts categories, separating tidak-tersedia", () => {
    expect(countByCategory(features, "actual")).toEqual({
      Rendah: 1,
      Sedang: 1,
      Tinggi: 0,
      "tidak-tersedia": 1,
    });
    expect(countByCategory(features, "predicted")).toEqual({
      Rendah: 1,
      Sedang: 1,
      Tinggi: 1,
      "tidak-tersedia": 0,
    });
  });
});

describe("computeRegionalSummary", () => {
  function makeIndicator(
    kodeBps: string,
    category: "Rendah" | "Sedang" | "Tinggi",
    prevalence: number | null,
  ): RegionIndicatorsDto {
    return {
      kodeBps,
      tahun: 2024,
      yCategory: category,
      y1Prevalence: prevalence,
      predictors: {},
    };
  }

  it("averages prevalence only over rows that have a value", () => {
    const summary = computeRegionalSummary([
      makeIndicator("1101", "Rendah", 10),
      makeIndicator("1102", "Sedang", 20),
      makeIndicator("1103", "Tinggi", null), // skipped from mean
    ]);
    expect(summary.averagePrevalence).toBe(15);
    expect(summary.withData).toBe(2);
    expect(summary.total).toBe(3);
  });

  it("returns null average when no prevalence is available", () => {
    const summary = computeRegionalSummary([
      makeIndicator("1101", "Rendah", null),
    ]);
    expect(summary.averagePrevalence).toBeNull();
  });

  it("computes distribution percentages summing to 100", () => {
    const summary = computeRegionalSummary([
      makeIndicator("1101", "Rendah", 10),
      makeIndicator("1102", "Sedang", 20),
      makeIndicator("1103", "Sedang", 22),
      makeIndicator("1104", "Tinggi", 35),
    ]);
    const total = summary.distribution.reduce((sum, s) => sum + s.percent, 0);
    expect(Math.round(total)).toBe(100);
    const sedang = summary.distribution.find((s) => s.category === "Sedang");
    expect(sedang?.count).toBe(2);
    expect(sedang?.percent).toBe(50);
  });

  it("handles empty input without dividing by zero", () => {
    const summary = computeRegionalSummary([]);
    expect(summary.total).toBe(0);
    expect(summary.distribution.every((s) => s.percent === 0)).toBe(true);
  });
});

describe("rankRegionByPrevalence", () => {
  function makeIndicator(
    kodeBps: string,
    prevalence: number | null,
  ): RegionIndicatorsDto {
    return {
      kodeBps,
      tahun: 2024,
      yCategory: "Sedang",
      y1Prevalence: prevalence,
      predictors: {},
    };
  }

  it("returns 1-indexed rank by descending prevalence", () => {
    const rows = [
      makeIndicator("1101", 10),
      makeIndicator("1102", 30),
      makeIndicator("1103", 20),
    ];
    expect(rankRegionByPrevalence(rows, "1102")).toEqual({ rank: 1, total: 3 });
    expect(rankRegionByPrevalence(rows, "1103")).toEqual({ rank: 2, total: 3 });
    expect(rankRegionByPrevalence(rows, "1101")).toEqual({ rank: 3, total: 3 });
  });

  it("returns null for regions without prevalence", () => {
    const rows = [makeIndicator("1101", 10), makeIndicator("1102", null)];
    expect(rankRegionByPrevalence(rows, "1102")).toBeNull();
  });

  it("returns null when the region is absent", () => {
    expect(rankRegionByPrevalence([], "1101")).toBeNull();
  });
});

describe("mergeYearlyRows", () => {
  function obs(
    kode: string,
    tahun: number,
    cat: "Rendah" | "Sedang" | "Tinggi",
  ): RegionIndicatorsDto {
    return {
      kodeBps: kode,
      tahun,
      yCategory: cat,
      y1Prevalence: 25,
      predictors: {},
    };
  }
  function pred(
    kode: string,
    tahun: number,
    cat: "Rendah" | "Sedang" | "Tinggi",
  ): ModelPredictionDto {
    return {
      modelVersion: "v1",
      kodeBps: kode,
      tahun,
      predictedCategory: cat,
      probRendah: 0.2,
      probSedang: 0.5,
      probTinggi: 0.3,
    };
  }

  it("interleaves observed and predicted rows, sorted ascending", () => {
    const merged = mergeYearlyRows(
      [obs("1101", 2022, "Sedang"), obs("1101", 2024, "Tinggi")],
      [pred("1101", 2023, "Rendah"), pred("1101", 2024, "Tinggi")],
    );
    expect(merged.map((r) => r.tahun)).toEqual([2022, 2023, 2024]);
    expect(merged[0]?.predicted).toBeNull();
    expect(merged[1]?.observed).toBeNull();
    expect(merged[2]?.observed?.yCategory).toBe("Tinggi");
    expect(merged[2]?.predicted?.predictedCategory).toBe("Tinggi");
  });

  it("returns empty array when both inputs are empty", () => {
    expect(mergeYearlyRows([], [])).toEqual([]);
  });
});
