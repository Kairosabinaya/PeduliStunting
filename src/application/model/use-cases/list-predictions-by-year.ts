import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { ModelPredictionRepository } from "@/domain/model/ports/model-prediction-repository";
import type { Year } from "@/domain/region/value-objects/year";
import { toModelPredictionDto, type ModelPredictionDto } from "../dtos";

export class ListPredictionsByYearUseCase {
  constructor(private readonly repository: ModelPredictionRepository) {}

  async execute(
    version: ModelVersion,
    tahun: Year,
  ): Promise<Result<readonly ModelPredictionDto[], AppError>> {
    const result = await this.repository.listByVersionAndYear(version, tahun);
    return map(result, (rows) => rows.map(toModelPredictionDto));
  }
}
