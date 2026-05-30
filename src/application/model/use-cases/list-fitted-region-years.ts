import type { AppError } from "@/domain/errors/app-error";
import type { LocalFitRepository } from "@/domain/model/ports/local-fit-repository";
import type { ModelVersion } from "@/domain/shared/ids";
import { ok, err, type Result } from "@/domain/shared/result";

/** Plain (kodeBps, tahun) pair for the simulator pickers. */
export interface FittedRegionYearDto {
  readonly kodeBps: string;
  readonly tahun: number;
}

/**
 * List every region-year the model fitted for a version, so the simulator can
 * restrict its region/year pickers to combinations that have a local fit.
 */
export class ListFittedRegionYearsUseCase {
  constructor(private readonly repo: LocalFitRepository) {}

  async execute(
    version: ModelVersion,
  ): Promise<Result<readonly FittedRegionYearDto[], AppError>> {
    const result = await this.repo.listFittedRegionYears(version);
    if (!result.ok) return err(result.error);
    return ok(
      result.value.map((fit) => ({ kodeBps: fit.kodeBps, tahun: fit.tahun })),
    );
  }
}
