import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import type { Year } from "@/domain/region/value-objects/year";
import { toRegionIndicatorsDto, type RegionIndicatorsDto } from "../dtos";

export class ListRegionIndicatorsByYearUseCase {
  constructor(private readonly repository: RegionIndicatorsRepository) {}

  async execute(
    tahun: Year,
  ): Promise<Result<readonly RegionIndicatorsDto[], AppError>> {
    const result = await this.repository.listByYear(tahun);
    return map(result, (rows) => rows.map(toRegionIndicatorsDto));
  }
}
