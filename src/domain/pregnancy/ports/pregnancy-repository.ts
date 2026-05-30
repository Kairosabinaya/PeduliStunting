import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { Pregnancy } from "../entities/pregnancy";

export interface NewPregnancyInput {
  readonly userId: UserId;
  readonly hpht: DateOnly;
  readonly expectedDue: DateOnly | null;
  readonly initialWeightKg: number | null;
  readonly heightCm: number | null;
  readonly notes: string | null;
}

export interface UpdatePregnancyInput {
  readonly userId: UserId;
  readonly pregnancyId: PregnancyId;
  readonly hpht: DateOnly;
  readonly expectedDue: DateOnly | null;
  readonly initialWeightKg: number | null;
  readonly heightCm: number | null;
  readonly notes: string | null;
}

export interface PregnancyRepository {
  /** Find the user's most recent non-archived pregnancy, or `null`. */
  findActiveByUser(userId: UserId): Promise<Result<Pregnancy | null, AppError>>;

  findById(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<Pregnancy | null, AppError>>;

  create(input: NewPregnancyInput): Promise<Result<Pregnancy, AppError>>;

  update(input: UpdatePregnancyInput): Promise<Result<Pregnancy, AppError>>;

  archive(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<void, AppError>>;
}
