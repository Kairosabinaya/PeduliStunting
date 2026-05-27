import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import { toRegionIndicatorsDto, type RegionIndicatorsDto } from "../dtos";

export class GetRegionIndicatorsUseCase {
  constructor(private readonly repository: RegionIndicatorsRepository) {}

  async execute(
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<RegionIndicatorsDto | null, AppError>> {
    const result = await this.repository.findOne(kodeBps, tahun);
    return map(result, (row) => (row ? toRegionIndicatorsDto(row) : null));
  }
}
