import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { GrowthIndicator } from "../value-objects/growth-indicator";
import type { LmsParams } from "../value-objects/lms-params";
import type { Sex } from "../value-objects/sex";

export interface GrowthStandardRepository {
  /**
   * Lookup LMS parameters for an age-based indicator (`BB_U`, `TB_U`, `LK_U`).
   * Returns the row at the exact `ageMonths` if present, otherwise `null`.
   */
  findForAge(
    indicator: Exclude<GrowthIndicator, "BB_TB">,
    sex: Sex,
    ageMonths: number,
  ): Promise<Result<LmsParams | null, AppError>>;

  /**
   * Lookup LMS parameters for `BB_TB`. The lookup axis is length/height in cm.
   * Implementations should return the nearest row at or below `lengthCm`.
   */
  findForLength(
    sex: Sex,
    lengthCm: number,
  ): Promise<Result<LmsParams | null, AppError>>;
}
