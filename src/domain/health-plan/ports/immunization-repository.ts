import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { Immunization } from "../entities/immunization";

export interface ImmunizationRepository {
  listSchedule(): Promise<Result<readonly Immunization[], AppError>>;
}
