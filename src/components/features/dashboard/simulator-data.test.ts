import { describe, expect, it } from "vitest";

import type {
  IndicatorDefinitionDto,
  RegionDto,
} from "@/application/region/dtos";
import type { PredictorModelMeta } from "@/domain/region/entities/indicator-definition";

import {
  buildRegionOptions,
  pickInitialSelection,
  sortSimulatorPredictors,
} from "./simulator-data";

function model(displayOrder: number | null): PredictorModelMeta {
  return {
    transform: "none",
    stdMean: 0,
    stdSd: 1,
    origMin: 0,
    origMax: 1,
    origP5: null,
    origP50: null,
    origP95: null,
    pctActive: null,
    pctPositive: null,
    medianCoef: null,
    corPrevalence: null,
    modelDimension: "Sosial-Ekonomi",
    displayOrder,
  };
}

function predictor(
  code: string,
  displayOrder: number | null,
): IndicatorDefinitionDto {
  return {
    code,
    dimension: "socioeconomic",
    name: code,
    description: null,
    unit: null,
    sourceLabel: null,
    sourceUrl: null,
    effectDirection: null,
    model: model(displayOrder),
  };
}

function region(kodeBps: string, provinsi: string): RegionDto {
  return {
    kodeBps,
    provinsi,
    kabupatenKota: `Kab ${kodeBps}`,
    tipe: "Kabupaten",
    latitude: null,
    longitude: null,
  };
}

describe("sortSimulatorPredictors", () => {
  it("keeps only rows with a display order, sorted X1..X20 numerically", () => {
    const sorted = sortSimulatorPredictors([
      predictor("X10", 10),
      predictor("Y", null),
      predictor("X2", 2),
      predictor("X1", 1),
    ]);
    expect(sorted.map((p) => p.code)).toEqual(["X1", "X2", "X10"]);
  });
});

describe("buildRegionOptions", () => {
  const regions = [
    region("1101", "Aceh"),
    region("3201", "Jawa Barat"),
    region("9999", "Papua"),
  ];
  const fitted = [
    { kodeBps: "1101", tahun: 2024 },
    { kodeBps: "1101", tahun: 2023 },
    { kodeBps: "3201", tahun: 2024 },
  ];

  it("keeps only regions with a fit and sorts years ascending", () => {
    const options = buildRegionOptions(regions, fitted);
    expect(options.map((o) => o.kodeBps)).toEqual(["1101", "3201"]);
    expect(options[0]?.years).toEqual([2023, 2024]);
  });

  it("sorts options by province then kabupaten name", () => {
    const options = buildRegionOptions(regions, fitted);
    expect(options.map((o) => o.provinsi)).toEqual(["Aceh", "Jawa Barat"]);
  });
});

describe("pickInitialSelection", () => {
  it("selects the first option at its latest year", () => {
    const selection = pickInitialSelection([
      {
        kodeBps: "1101",
        kabupatenKota: "A",
        provinsi: "Aceh",
        years: [2023, 2024],
      },
    ]);
    expect(selection).toEqual({ kodeBps: "1101", tahun: 2024 });
  });

  it("returns null when there are no options", () => {
    expect(pickInitialSelection([])).toBeNull();
  });
});
