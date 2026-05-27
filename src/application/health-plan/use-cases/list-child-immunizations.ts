import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { ChildImmunizationRepository } from "@/domain/health-plan/ports/child-immunization-repository";
import { toChildImmunizationDto, type ChildImmunizationDto } from "../dtos";

export class ListChildImmunizationsUseCase {
  constructor(private readonly repository: ChildImmunizationRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildImmunizationDto[], AppError>> {
    const result = await this.repository.listByChild(userId, childId);
    return map(result, (rows) => rows.map(toChildImmunizationDto));
  }
}
