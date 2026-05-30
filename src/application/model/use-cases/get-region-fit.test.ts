import { describe, expect, it } from "vitest";

import { err, ok } from "@/domain/shared/result";
import { AppErrors } from "@/domain/errors/app-error";
import { LocalCoefficient } from "@/domain/model/entities/local-coefficient";
import { LocalFit } from "@/domain/model/entities/local-fit";
import { ModelPrediction } from "@/domain/model/entities/model-prediction";
import { ClassProbabilities } from "@/domain/model/value-objects/class-probabilities";
import type { LocalCoefficientRepository } from "@/domain/model/ports/local-coefficient-repository";
import type { LocalFitRepository } from "@/domain/model/ports/local-fit-repository";
import type { ModelPredictionRepository } from "@/domain/model/ports/model-prediction-repository";
import { Region } from "@/domain/region/entities/region";
import { RegionIndicators } from "@/domain/region/entities/region-indicators";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import {
  asIndicatorCode,
  asModelVersion,
  type IndicatorCode,
} from "@/domain/shared/ids";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";
import { asYear } from "@/domain/region/value-objects/year";

import { GetRegionFitUseCase } from "./get-region-fit";

const VERSION = asModelVersion("gtwenolr-adaptif-1.0");
const KODE = "1101";
const TAHUN = 2024;

function fit(): LocalFit {
  return new LocalFit({
    modelVersion: VERSION,
    kodeBps: asKodeBps(KODE),
    tahun: asYear(TAHUN),
    alfa1: -0.7,
    alfa2: 2.6,
    nActive: 17,
    converged: false,
  });
}

function coef(predictor: string, coefficient: number): LocalCoefficient {
  return new LocalCoefficient({
    modelVersion: VERSION,
    kodeBps: asKodeBps(KODE),
    tahun: asYear(TAHUN),
    predictorCode: asIndicatorCode(predictor),
    coefficient,
    se: null,
    isInference: false,
  });
}

function indicators(): RegionIndicators {
  const predictors = new Map<IndicatorCode, number | null>();
  predictors.set(asIndicatorCode("x1"), 5);
  predictors.set(asIndicatorCode("x2"), 10);
  predictors.set(asIndicatorCode("x10"), 42);
  return new RegionIndicators({
    kodeBps: asKodeBps(KODE),
    tahun: asYear(TAHUN),
    yCategory: "Sedang",
    y1Prevalence: 25,
    predictors,
  });
}

function region(): Region {
  return new Region({
    kodeBps: asKodeBps(KODE),
    provinsi: "Aceh",
    kabupatenKota: "Simeulue",
    tipe: "Kabupaten",
    latitude: null,
    longitude: null,
  });
}

interface Fakes {
  readonly localFit?: LocalFit | null;
  readonly coefficients?: readonly LocalCoefficient[];
  readonly region?: Region | null;
  readonly indicators?: RegionIndicators | null;
  readonly prediction?: ModelPrediction | null;
}

function build(fakes: Fakes): GetRegionFitUseCase {
  const localFitRepo: LocalFitRepository = {
    findByRegionYear: async () =>
      ok(fakes.localFit === undefined ? fit() : fakes.localFit),
    listFittedRegionYears: async () => ok([]),
  };
  const coefficientRepo: LocalCoefficientRepository = {
    listByRegionAndYear: async () =>
      ok(fakes.coefficients ?? [coef("X1", 0.5), coef("X2", -0.3)]),
    listByVersion: async () => ok([]),
  };
  const regionRepo = {
    list: async () => ok([]),
    findByKodeBps: async () =>
      ok(fakes.region === undefined ? region() : fakes.region),
    listByProvinsi: async () => ok([]),
  } as unknown as RegionRepository;
  const indicatorsRepo = {
    listByYear: async () => ok([]),
    findByRegion: async () => ok([]),
    findOne: async () =>
      ok(fakes.indicators === undefined ? indicators() : fakes.indicators),
    listAvailableYears: async () => ok([]),
  } as unknown as RegionIndicatorsRepository;
  const predictionRepo = {
    listByVersionAndYear: async () => ok([]),
    findByVersionAndRegion: async () => ok([]),
    findOne: async () =>
      ok(
        fakes.prediction === undefined
          ? new ModelPrediction({
              modelVersion: VERSION,
              kodeBps: asKodeBps(KODE),
              tahun: asYear(TAHUN),
              predictedCategory: "Sedang",
              probabilities: new ClassProbabilities({
                rendah: 0.1,
                sedang: 0.6,
                tinggi: 0.3,
              }),
            })
          : fakes.prediction,
      ),
    listAvailableYears: async () => ok([]),
  } as unknown as ModelPredictionRepository;

  return new GetRegionFitUseCase(
    localFitRepo,
    coefficientRepo,
    regionRepo,
    indicatorsRepo,
    predictionRepo,
  );
}

describe("GetRegionFitUseCase", () => {
  it("assembles the region fit with X1..X20-ordered beta and defaults", async () => {
    const useCase = build({});
    const result = await useCase.execute({
      version: VERSION,
      kodeBps: KODE,
      tahun: TAHUN,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.value === null) throw new Error("expected dto");
    const dto = result.value;
    expect(dto.beta).toHaveLength(20);
    expect(dto.defaults).toHaveLength(20);
    expect(dto.beta[0]).toBe(0.5);
    expect(dto.beta[1]).toBe(-0.3);
    expect(dto.beta[2]).toBe(0); // X3 absent -> zero (selected out)
    expect(dto.defaults[0]).toBe(5);
    expect(dto.defaults[1]).toBe(10);
    expect(dto.defaults[9]).toBe(42); // x10
    expect(dto.actualCategory).toBe("Sedang");
    expect(dto.kabupatenKota).toBe("Simeulue");
    expect(dto.observed).toMatchObject({ sedang: 0.6 });
  });

  it("orders beta by numeric predictor index regardless of repo order", async () => {
    const useCase = build({
      coefficients: [coef("X10", 1.1), coef("X2", 2.2)],
    });
    const result = await useCase.execute({
      version: VERSION,
      kodeBps: KODE,
      tahun: TAHUN,
    });
    if (!result.ok || result.value === null) throw new Error("expected dto");
    expect(result.value.beta[1]).toBe(2.2); // X2
    expect(result.value.beta[9]).toBe(1.1); // X10
  });

  it("returns null when the model did not fit the region-year", async () => {
    const useCase = build({ localFit: null });
    const result = await useCase.execute({
      version: VERSION,
      kodeBps: KODE,
      tahun: TAHUN,
    });
    expect(result).toEqual(ok(null));
  });

  it("returns null when the region or its indicators are missing", async () => {
    const result = await build({ indicators: null }).execute({
      version: VERSION,
      kodeBps: KODE,
      tahun: TAHUN,
    });
    expect(result).toEqual(ok(null));
  });

  it("tolerates a missing stored prediction", async () => {
    const useCase = build({ prediction: null });
    const result = await useCase.execute({
      version: VERSION,
      kodeBps: KODE,
      tahun: TAHUN,
    });
    if (!result.ok || result.value === null) throw new Error("expected dto");
    expect(result.value.observed).toBeNull();
  });

  it("rejects an invalid kode_bps", async () => {
    const result = await build({}).execute({
      version: VERSION,
      kodeBps: "11",
      tahun: TAHUN,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
  });

  it("propagates repository failures", async () => {
    const localFitRepo: LocalFitRepository = {
      findByRegionYear: async () =>
        err(AppErrors.externalService("down", "supabase")),
      listFittedRegionYears: async () => ok([]),
    };
    const useCase = new GetRegionFitUseCase(
      localFitRepo,
      {
        listByRegionAndYear: async () => ok([]),
        listByVersion: async () => ok([]),
      },
      {
        list: async () => ok([]),
        findByKodeBps: async () => ok(region()),
        listByProvinsi: async () => ok([]),
      } as unknown as RegionRepository,
      {
        listByYear: async () => ok([]),
        findByRegion: async () => ok([]),
        findOne: async () => ok(indicators()),
        listAvailableYears: async () => ok([]),
      } as unknown as RegionIndicatorsRepository,
      {
        listByVersionAndYear: async () => ok([]),
        findByVersionAndRegion: async () => ok([]),
        findOne: async () => ok(null),
        listAvailableYears: async () => ok([]),
      } as unknown as ModelPredictionRepository,
    );
    const result = await useCase.execute({
      version: VERSION,
      kodeBps: KODE,
      tahun: TAHUN,
    });
    expect(result.ok).toBe(false);
  });
});
