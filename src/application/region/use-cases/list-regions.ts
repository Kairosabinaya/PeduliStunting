import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import { toRegionDto, type RegionDto } from "../dtos";

export class ListRegionsUseCase {
  constructor(private readonly regions: RegionRepository) {}

  async execute(): Promise<Result<readonly RegionDto[], AppError>> {
    const result = await this.regions.list();
    return map(result, (rows) => rows.map(toRegionDto));
  }
}
