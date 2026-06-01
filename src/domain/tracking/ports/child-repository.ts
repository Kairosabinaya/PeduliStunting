import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { Child } from "../entities/child";

export interface NewChildInput {
  readonly userId: UserId;
  readonly name: string;
  readonly sex: Child["sex"];
  readonly birthDate: Child["birthDate"];
  readonly birthWeightKg: number | null;
  readonly birthLengthCm: number | null;
  readonly gestationalAgeWeeks: number | null;
  readonly notes: string | null;
}

/** Full overwrite of a child's editable fields, scoped to its owner. */
export interface UpdateChildInput extends NewChildInput {
  readonly childId: ChildId;
}

export interface ChildRepository {
  listByOwner(userId: UserId): Promise<Result<readonly Child[], AppError>>;
  findById(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<Child | null, AppError>>;
  create(input: NewChildInput): Promise<Result<Child, AppError>>;
  update(input: UpdateChildInput): Promise<Result<Child, AppError>>;
  softDelete(userId: UserId, childId: ChildId): Promise<Result<void, AppError>>;
}
