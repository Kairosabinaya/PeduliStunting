import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { ModelPredictionRepository } from "@/domain/model/ports/model-prediction-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { toModelPredictionDto, type ModelPredictionDto } from "../dtos";

/**
 * Fetch every prediction row for a single region across all years emitted by
 * the given model version. Powers the Map page detail panel toggle between
 * observed and predicted category trends.
 */
export class ListPredictionsByRegionUseCase {
  constructor(private readonly repository: ModelPredictionRepository) {}

  async execute(
    version: ModelVersion,
    kodeBps: KodeBps,
  ): Promise<Result<readonly ModelPredictionDto[], AppError>> {
    const result = await this.repository.findByVersionAndRegion(
      version,
      kodeBps,
    );
    return map(result, (rows) => rows.map(toModelPredictionDto));
  }
}
