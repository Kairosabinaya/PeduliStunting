import { describe, expect, it } from "vitest";

import { ok } from "@/domain/shared/result";

import {
  fakeAiToolUseCases,
  fakeLogger,
  makeIndicatorsDto,
  makePrediction,
  makeRegionDto,
} from "../../../../tests/factories/ai";
import { isToolFailure } from "@/application/ai/cards/ai-card";
import type { AiToolContext } from "./tool-context";
import { createCompareRegionsTool } from "./compare-regions-tool";
import { createFindRegionTool } from "./find-region-tool";
import { createRankRegionsTool } from "./rank-regions-tool";
import { createRegionPredictionTool } from "./region-prediction-tool";
import { createRegionTrendTool } from "./region-trend-tool";

function ctx(
  over: Parameters<typeof fakeAiToolUseCases>[0] = {},
): AiToolContext {
  return { useCases: fakeAiToolUseCases(over), logger: fakeLogger() };
}

const TWO_REGIONS = {
  listRegions: {
    execute: async () =>
      ok([
        makeRegionDto(),
        makeRegionDto({ kodeBps: "3525", kabupatenKota: "Kabupaten Gresik" }),
      ]),
  },
  listRegionIndicatorsByYear: {
    execute: async () =>
      ok([
        makeIndicatorsDto({ y1Prevalence: 12.5, yCategory: "Rendah" }),
        makeIndicatorsDto({
          kodeBps: "3525",
          y1Prevalence: 28,
          yCategory: "Tinggi",
        }),
      ]),
  },
};

describe("createFindRegionTool", () => {
  it("returns candidate matches for a name", async () => {
    const result = await createFindRegionTool(ctx()).execute({
      query: "Surabaya",
    });
    expect(isToolFailure(result)).toBe(false);
    if (!isToolFailure(result) && "matches" in result) {
      expect(result.matches[0]?.kodeBps).toBe("3578");
    }
  });

  it("fails not_found for an unknown name", async () => {
    const result = await createFindRegionTool(ctx()).execute({
      query: "atlantis",
    });
    expect(isToolFailure(result) && result.reason).toBe("not_found");
  });
});

describe("createCompareRegionsTool", () => {
  it("builds a comparison card for the requested regions", async () => {
    const result = await createCompareRegionsTool(ctx(TWO_REGIONS)).execute({
      kodeBpsList: ["3578", "3525"],
      tahun: 2024,
    });
    if (isToolFailure(result)) throw new Error("expected a card");
    if ("type" in result && result.type === "compare-regions") {
      expect(result.rows).toHaveLength(2);
      expect(result.tahun).toBe(2024);
    }
  });
});

describe("createRankRegionsTool", () => {
  it("orders descending (worst first) and ranks", async () => {
    const result = await createRankRegionsTool(ctx(TWO_REGIONS)).execute({
      tahun: 2024,
      order: "desc",
      limit: 5,
    });
    if (isToolFailure(result)) throw new Error("expected a card");
    if ("type" in result && result.type === "rank-regions") {
      expect(result.rows[0]?.kodeBps).toBe("3525");
      expect(result.rows[0]?.rank).toBe(1);
    }
  });
});

describe("createRegionTrendTool", () => {
  it("returns a year-sorted series", async () => {
    const result = await createRegionTrendTool(ctx()).execute({
      kodeBps: "3578",
    });
    if (isToolFailure(result)) throw new Error("expected a card");
    if ("type" in result && result.type === "region-trend") {
      expect(result.series.map((p) => p.tahun)).toEqual([2021, 2024]);
    }
  });
});

describe("createRegionPredictionTool", () => {
  it("returns a prediction card for an available year", async () => {
    const result = await createRegionPredictionTool(ctx()).execute({
      kodeBps: "3578",
      tahun: 2025,
    });
    if (isToolFailure(result)) throw new Error("expected a card");
    if ("type" in result && result.type === "region-prediction") {
      expect(result.predictedCategory).toBe("Rendah");
    }
  });

  it("fails no_data for a year without a prediction", async () => {
    const useCases = {
      listPredictionsByRegion: {
        execute: async () => ok([makePrediction({ tahun: 2025 })]),
      },
    };
    const result = await createRegionPredictionTool(ctx(useCases)).execute({
      kodeBps: "3578",
      tahun: 2023,
    });
    expect(isToolFailure(result) && result.reason).toBe("no_data");
  });
});
