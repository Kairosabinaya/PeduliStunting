import type { RegionFitDto } from "@/application/model/dtos";
import type { AppError } from "@/domain/errors/app-error";
import { AppErrors } from "@/domain/errors/app-error";
import type { LocalCoefficientRepository } from "@/domain/model/ports/local-coefficient-repository";
import type { LocalFitRepository } from "@/domain/model/ports/local-fit-repository";
import type { ModelPredictionRepository } from "@/domain/model/ports/model-prediction-repository";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import { asIndicatorCode, type ModelVersion } from "@/domain/shared/ids";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";
import { asYear } from "@/domain/region/value-objects/year";
import { ok, err, type Result } from "@/domain/shared/result";

const PREDICTOR_COUNT = 20;

export interface GetRegionFitInput {
  readonly version: ModelVersion;
  readonly kodeBps: string;
  readonly tahun: number;
}

/**
 * Assemble the data the what-if simulator needs to run `predictOrdinal` for one
 * region-year: the local intercepts + slopes (ordered X1..X20), the region's
 * actual predictor values (slider defaults), its observed class, and the
 * model's stored probabilities. Returns `null` when the model did not fit the
 * requested region-year (unbalanced panel) so the UI can empty-state it.
 */
export class GetRegionFitUseCase {
  constructor(
    private readonly localFitRepo: LocalFitRepository,
    private readonly localCoefficientRepo: LocalCoefficientRepository,
    private readonly regionRepo: RegionRepository,
    private readonly regionIndicatorsRepo: RegionIndicatorsRepository,
    private readonly modelPredictionRepo: ModelPredictionRepository,
  ) {}

  async execute(
    input: GetRegionFitInput,
  ): Promise<Result<RegionFitDto | null, AppError>> {
    if (!/^\d{4}$/u.test(input.kodeBps)) {
      return err(
        AppErrors.validation(`kode_bps tidak valid: ${input.kodeBps}`),
      );
    }
    if (!Number.isInteger(input.tahun)) {
      return err(AppErrors.validation(`tahun tidak valid: ${input.tahun}`));
    }
    const kodeBps = asKodeBps(input.kodeBps);
    const tahun = asYear(input.tahun);

    const fitResult = await this.localFitRepo.findByRegionYear(
      input.version,
      kodeBps,
      tahun,
    );
    if (!fitResult.ok) return err(fitResult.error);
    if (fitResult.value === null) return ok(null);
    const fit = fitResult.value;

    const [coefResult, indicatorsResult, regionResult, predictionResult] =
      await Promise.all([
        this.localCoefficientRepo.listByRegionAndYear(
          input.version,
          kodeBps,
          tahun,
        ),
        this.regionIndicatorsRepo.findOne(kodeBps, tahun),
        this.regionRepo.findByKodeBps(kodeBps),
        this.modelPredictionRepo.findOne(input.version, kodeBps, tahun),
      ]);

    if (!coefResult.ok) return err(coefResult.error);
    if (!indicatorsResult.ok) return err(indicatorsResult.error);
    if (!regionResult.ok) return err(regionResult.error);
    if (!predictionResult.ok) return err(predictionResult.error);

    const indicators = indicatorsResult.value;
    const region = regionResult.value;
    if (indicators === null || region === null) return ok(null);

    const betaByIndex = new Map<number, number>();
    for (const coef of coefResult.value) {
      const index = Number.parseInt(coef.predictorCode.replace(/\D/gu, ""), 10);
      if (Number.isInteger(index)) betaByIndex.set(index, coef.coefficient);
    }

    const beta: number[] = [];
    const defaults: number[] = [];
    for (let k = 1; k <= PREDICTOR_COUNT; k += 1) {
      beta.push(betaByIndex.get(k) ?? 0);
      const value = indicators.predictors.get(asIndicatorCode(`x${k}`));
      defaults.push(value ?? 0);
    }

    const prediction = predictionResult.value;
    return ok({
      modelVersion: input.version,
      kodeBps: region.kodeBps,
      kabupatenKota: region.kabupatenKota,
      provinsi: region.provinsi,
      tahun: fit.tahun,
      alfa1: fit.alfa1,
      alfa2: fit.alfa2,
      nActive: fit.nActive,
      converged: fit.converged,
      beta,
      defaults,
      actualCategory: indicators.yCategory,
      observed:
        prediction === null
          ? null
          : {
              rendah: prediction.probabilities.rendah,
              sedang: prediction.probabilities.sedang,
              tinggi: prediction.probabilities.tinggi,
            },
    });
  }
}
