import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { RegionIndicators } from "../entities/region-indicators";
import type { KodeBps } from "../value-objects/kode-bps";
import type { Year } from "../value-objects/year";

export interface RegionIndicatorsRepository {
  listByYear(tahun: Year): Promise<Result<readonly RegionIndicators[], AppError>>;
  findByRegion(
    kodeBps: KodeBps,
  ): Promise<Result<readonly RegionIndicators[], AppError>>;
  findOne(
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<RegionIndicators | null, AppError>>;
  listAvailableYears(): Promise<Result<readonly Year[], AppError>>;
}
