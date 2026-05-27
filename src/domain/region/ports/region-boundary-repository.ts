import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { RegionBoundary } from "../entities/region-boundary";
import type { KodeBps } from "../value-objects/kode-bps";

export interface RegionBoundaryRepository {
  listAll(): Promise<Result<readonly RegionBoundary[], AppError>>;
  findByKodeBps(
    kodeBps: KodeBps,
  ): Promise<Result<RegionBoundary | null, AppError>>;
}
