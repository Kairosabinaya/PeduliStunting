import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { IndicatorCode } from "@/domain/shared/ids";
import type { IndicatorDefinition } from "../entities/indicator-definition";

export interface IndicatorDictionaryRepository {
  list(): Promise<Result<readonly IndicatorDefinition[], AppError>>;
  findByCode(
    code: IndicatorCode,
  ): Promise<Result<IndicatorDefinition | null, AppError>>;
}
