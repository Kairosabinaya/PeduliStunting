import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { ChildMilestoneRepository } from "@/domain/health-plan/ports/child-milestone-repository";
import { toChildMilestoneDto, type ChildMilestoneDto } from "../dtos";

export class ListChildMilestonesUseCase {
  constructor(private readonly repository: ChildMilestoneRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildMilestoneDto[], AppError>> {
    const result = await this.repository.listByChild(userId, childId);
    return map(result, (rows) => rows.map(toChildMilestoneDto));
  }
}
