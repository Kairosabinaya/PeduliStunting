import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type {
  ChildId,
  MilestoneId,
  UserId,
} from "@/domain/shared/ids";
import type {
  ChildMilestone,
  ChildMilestoneStatus,
} from "../entities/child-milestone";

export interface ChildMilestoneRepository {
  listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildMilestone[], AppError>>;
  upsertStatus(input: {
    userId: UserId;
    childId: ChildId;
    milestoneId: MilestoneId;
    status: ChildMilestoneStatus;
    checkedAt: ChildMilestone["checkedAt"];
    note: string | null;
  }): Promise<Result<ChildMilestone, AppError>>;
}
