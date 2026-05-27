import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { Milestone } from "../entities/milestone";

export interface MilestoneRepository {
  list(): Promise<Result<readonly Milestone[], AppError>>;
}
