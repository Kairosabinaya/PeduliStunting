import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { Year } from "@/domain/region/value-objects/year";
import type { LocalCoefficientRepository } from "@/domain/model/ports/local-coefficient-repository";
import {
  summariseCoefficients,
  type CoefficientSummaryDto,
} from "../dtos";

export interface GetCoefficientSummaryInput {
  readonly version: ModelVersion;
  readonly tahun?: Year;
}

/**
 * Reduce the per-region coefficient export into a single aggregate row per
 * predictor. The dashboard what-if simulator multiplies the mean coefficient
 * by the user-chosen \u0394 to estimate the population-level log-odds shift.
 *
 * Returns an empty `items` list (not an error) when no coefficient rows exist
 * for the requested version/year — the page renders the explanatory empty
 * state in that case.
 */
export class GetCoefficientSummaryUseCase {
  constructor(private readonly repository: LocalCoefficientRepository) {}

  async execute(
    input: GetCoefficientSummaryInput,
  ): Promise<Result<CoefficientSummaryDto, AppError>> {
    const rowsResult = await this.repository.listByVersion(
      input.version,
      input.tahun,
    );
    return map(rowsResult, (rows) =>
      summariseCoefficients(input.version, input.tahun ?? null, rows),
    );
  }
}
