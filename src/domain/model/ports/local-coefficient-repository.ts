import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ModelVersion } from "@/domain/shared/ids";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import type { LocalCoefficient } from "../entities/local-coefficient";

export interface LocalCoefficientRepository {
  listByRegionAndYear(
    version: ModelVersion,
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<readonly LocalCoefficient[], AppError>>;

  /**
   * Load every coefficient row for a model version, optionally constrained to
   * a single year. Used by aggregation pipelines (what-if simulator) that
   * need the full per-region distribution.
   */
  listByVersion(
    version: ModelVersion,
    tahun?: Year,
  ): Promise<Result<readonly LocalCoefficient[], AppError>>;
}
