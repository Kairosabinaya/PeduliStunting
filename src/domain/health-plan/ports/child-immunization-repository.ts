import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type {
  ChildImmunization,
  ChildImmunizationStatus,
} from "../entities/child-immunization";

export interface ChildImmunizationRepository {
  listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildImmunization[], AppError>>;
  upsertStatus(input: {
    userId: UserId;
    childId: ChildId;
    immunizationCode: ChildImmunization["immunizationCode"];
    status: ChildImmunizationStatus;
    givenAt: ChildImmunization["givenAt"];
    note: string | null;
  }): Promise<Result<ChildImmunization, AppError>>;
}
