import type { Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { Region } from "../entities/region";
import type { KodeBps } from "../value-objects/kode-bps";

export interface RegionRepository {
  list(): Promise<Result<readonly Region[], AppError>>;
  findByKodeBps(kodeBps: KodeBps): Promise<Result<Region | null, AppError>>;
}
