/**
 * Test factories for the AI feature. Plain-object fakes for the structural tool
 * dependencies + DTO builders, so unit tests stay DRY and parallel-safe.
 */

import type { ChildOverviewLoader } from "@/application/ai/ports/child-overview-loader";
import type { ChatModelPort } from "@/application/ai/ports/chat-model-port";
import type {
  RateLimitDecision,
  RateLimiterPort,
} from "@/application/ai/ports/rate-limiter-port";
import type {
  AiToolSession,
  AiToolUseCases,
} from "@/application/ai/tools/tool-context";
import type {
  ModelMetadataDto,
  ModelPredictionDto,
} from "@/application/model/dtos";
import type {
  IndicatorDefinitionDto,
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import type { EffectDirection } from "@/domain/region/entities/indicator-definition";
import type { ChildOverviewData } from "@/lib/child-overview";
import { asUserId } from "@/domain/shared/ids";
import type { Logger } from "@/domain/shared/logger";
import { ok } from "@/domain/shared/result";

export function fakeLogger(): Logger {
  const noop = (): void => undefined;
  const logger: Logger = {
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
    child: () => logger,
  };
  return logger;
}

export function makeRegionDto(over: Partial<RegionDto> = {}): RegionDto {
  return {
    kodeBps: "3578",
    provinsi: "Jawa Timur",
    kabupatenKota: "Kota Surabaya",
    tipe: "Kota",
    latitude: null,
    longitude: null,
    ...over,
  };
}

export function makeIndicatorsDto(
  over: Partial<RegionIndicatorsDto> = {},
): RegionIndicatorsDto {
  return {
    kodeBps: "3578",
    tahun: 2024,
    yCategory: "Rendah",
    y1Prevalence: 12.5,
    predictors: {},
    ...over,
  };
}

export function makePrediction(
  over: Partial<ModelPredictionDto> = {},
): ModelPredictionDto {
  return {
    modelVersion: "gtwenolr-1.0",
    kodeBps: "3578",
    tahun: 2025,
    predictedCategory: "Rendah",
    probRendah: 0.8,
    probSedang: 0.15,
    probTinggi: 0.05,
    ...over,
  };
}

export function makeModelMetadata(
  over: Partial<ModelMetadataDto> = {},
): ModelMetadataDto {
  return {
    version: "gtwenolr-1.0",
    name: "GTWENOLR",
    etaSign: 1,
    hyperparameters: {},
    metrics: { accuracy: 0.72, qwk: 0.7 },
    moranPerYear: {},
    notes: null,
    isDefault: true,
    ...over,
  };
}

export function makeIndicatorDefinition(
  over: {
    readonly name?: string;
    readonly effectDirection?: EffectDirection;
    readonly corPrevalence?: number;
  } = {},
): IndicatorDefinitionDto {
  return {
    code: "X1",
    dimension: "socioeconomic",
    name: over.name ?? "Akses air bersih",
    description: null,
    unit: null,
    sourceLabel: null,
    sourceUrl: null,
    effectDirection: over.effectDirection ?? "protective",
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
      corPrevalence: over.corPrevalence ?? -0.42,
      modelDimension: "Sosial-Ekonomi",
      displayOrder: 1,
    },
  };
}

export function fakeAiToolUseCases(
  over: Partial<AiToolUseCases> = {},
): AiToolUseCases {
  return {
    listRegions: { execute: async () => ok([makeRegionDto()]) },
    getRegionByKodeBps: { execute: async () => ok(makeRegionDto()) },
    listRegionIndicatorsByYear: {
      execute: async () => ok([makeIndicatorsDto()]),
    },
    listRegionIndicatorsHistory: {
      execute: async () =>
        ok([
          makeIndicatorsDto({ tahun: 2021, y1Prevalence: 18 }),
          makeIndicatorsDto({ tahun: 2024, y1Prevalence: 12.5 }),
        ]),
    },
    getDefaultModelMetadata: { execute: async () => ok(makeModelMetadata()) },
    listPredictionsByRegion: { execute: async () => ok([makePrediction()]) },
    ...over,
  };
}

export function fakeSession(
  userId = "11111111-1111-1111-1111-111111111111",
): AiToolSession {
  return { userId: asUserId(userId) };
}

export function makeChildOverview(
  over: Partial<ChildOverviewData> = {},
): ChildOverviewData {
  return {
    child: {
      id: "c1",
      userId: "u1",
      name: "Budi",
      sex: "L",
      birthDate: "2024-01-15",
      birthWeightKg: null,
      birthLengthCm: null,
      gestationalAgeWeeks: null,
      notes: null,
    },
    childAgeMonths: 12,
    measurements: [],
    immunizationSchedule: [],
    childImmunizations: [],
    milestoneCatalog: [],
    childMilestones: [],
    nutritionEvents: [],
    ...over,
  };
}

export function fakeChildOverviewLoader(
  result: Awaited<ReturnType<ChildOverviewLoader>>,
): ChildOverviewLoader {
  return async () => result;
}

export function fakeRateLimiter(decision: RateLimitDecision): RateLimiterPort {
  return { check: async () => decision };
}

export function fakeChatModel(): ChatModelPort {
  return {
    stream: async () => ({
      toResponse: () => new Response("stream", { status: 200 }),
    }),
  };
}
