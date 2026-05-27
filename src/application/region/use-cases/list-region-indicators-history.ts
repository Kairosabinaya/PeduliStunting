import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { toRegionIndicatorsDto, type RegionIndicatorsDto } from "../dtos";

/**
 * Fetch every observed indicator row for a single region across all imported
 * years. Used by the Map page detail panel to render the year-over-year
 * history sparkline and category trend.
 */
export class ListRegionIndicatorsHistoryUseCase {
  constructor(private readonly repository: RegionIndicatorsRepository) {}

  async execute(
    kodeBps: KodeBps,
  ): Promise<Result<readonly RegionIndicatorsDto[], AppError>> {
    const result = await this.repository.findByRegion(kodeBps);
    return map(result, (rows) => rows.map(toRegionIndicatorsDto));
  }
}
