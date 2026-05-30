import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ModelVersion } from "@/domain/shared/ids";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import type { LocalFit } from "../entities/local-fit";

/** Lightweight reference to a region-year that has a local fit. */
export interface FittedRegionYear {
  readonly kodeBps: KodeBps;
  readonly tahun: Year;
}

export interface LocalFitRepository {
  /**
   * Load the local intercepts + diagnostics for one region-year. Returns `null`
   * (not an error) when the model did not fit that region-year — the panel is
   * unbalanced, so the simulator empty-states the missing combinations.
   */
  findByRegionYear(
    version: ModelVersion,
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<LocalFit | null, AppError>>;

  /**
   * List every (kodeBps, tahun) the model fitted for a version. Used by the
   * simulator to restrict the region/year pickers to selectable combinations.
   */
  listFittedRegionYears(
    version: ModelVersion,
  ): Promise<Result<readonly FittedRegionYear[], AppError>>;
}
