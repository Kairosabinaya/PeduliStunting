import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, MilestoneId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { ChildMilestoneRepository } from "@/domain/health-plan/ports/child-milestone-repository";
import type { ChildMilestoneStatus } from "@/domain/health-plan/entities/child-milestone";
import { toChildMilestoneDto, type ChildMilestoneDto } from "../dtos";

export interface UpsertChildMilestoneCommand {
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly milestoneId: MilestoneId;
  readonly status: ChildMilestoneStatus;
  readonly checkedAt: DateOnly | null;
  readonly note: string | null;
}

export class UpsertChildMilestoneUseCase {
  constructor(private readonly repository: ChildMilestoneRepository) {}

  async execute(
    command: UpsertChildMilestoneCommand,
  ): Promise<Result<ChildMilestoneDto, AppError>> {
    const result = await this.repository.upsertStatus({
      userId: command.userId,
      childId: command.childId,
      milestoneId: command.milestoneId,
      status: command.status,
      checkedAt: command.checkedAt,
      note: command.note,
    });
    return map(result, toChildMilestoneDto);
  }
}
