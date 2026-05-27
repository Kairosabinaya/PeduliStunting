import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ModelVersion } from "@/domain/shared/ids";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import type { ModelPrediction } from "../entities/model-prediction";

export interface ModelPredictionRepository {
  listByVersionAndYear(
    version: ModelVersion,
    tahun: Year,
  ): Promise<Result<readonly ModelPrediction[], AppError>>;
  findByVersionAndRegion(
    version: ModelVersion,
    kodeBps: KodeBps,
  ): Promise<Result<readonly ModelPrediction[], AppError>>;
  findOne(
    version: ModelVersion,
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<ModelPrediction | null, AppError>>;
  listAvailableYears(
    version: ModelVersion,
  ): Promise<Result<readonly Year[], AppError>>;
}
