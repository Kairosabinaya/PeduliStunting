import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionBoundaryRepository } from "@/domain/region/ports/region-boundary-repository";
import { toRegionBoundaryDto, type RegionBoundaryDto } from "../dtos";

export class ListRegionBoundariesUseCase {
  constructor(private readonly repository: RegionBoundaryRepository) {}

  async execute(): Promise<Result<readonly RegionBoundaryDto[], AppError>> {
    const result = await this.repository.listAll();
    return map(result, (rows) => rows.map(toRegionBoundaryDto));
  }
}
