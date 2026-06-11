import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { toRegionDto, type RegionDto } from "../dtos";

export class GetRegionByKodeBpsUseCase {
  constructor(private readonly regions: RegionRepository) {}

  async execute(kodeBps: KodeBps): Promise<Result<RegionDto | null, AppError>> {
    const result = await this.regions.findByKodeBps(kodeBps);
    return map(result, (row) => (row ? toRegionDto(row) : null));
  }
}
