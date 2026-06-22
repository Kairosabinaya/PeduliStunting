import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, map, type Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";
import type { Sex } from "@/domain/tracking/value-objects/sex";
import { toChildDto, type ChildDto } from "../dtos";

export interface UpdateChildCommand {
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly name: string;
  readonly sex: Sex;
  readonly birthDate: DateOnly;
  readonly birthWeightKg: number | null;
  readonly birthLengthCm: number | null;
  readonly gestationalAgeWeeks: number | null;
  readonly notes: string | null;
}

/**
 * Overwrite a child's editable fields. Verifies the child exists and is owned
 * by the caller first (so a missing or foreign id yields a clean `not_found`
 * instead of a silent no-op), then persists the new values. The owner scope is
 * also enforced by RLS and by the repository's `eq(user_id)` filter — this is
 * defence in depth.
 */
export class UpdateChildUseCase {
  constructor(private readonly repository: ChildRepository) {}

  async execute(
    command: UpdateChildCommand,
  ): Promise<Result<ChildDto, AppError>> {
    const existing = await this.repository.findById(
      command.userId,
      command.childId,
    );
    if (!existing.ok) return existing;
    if (existing.value === null) {
      return err(AppErrors.notFound("Anak tidak ditemukan.", "child"));
    }

    const result = await this.repository.update({
      userId: command.userId,
      childId: command.childId,
      name: command.name,
      sex: command.sex,
      birthDate: command.birthDate,
      birthWeightKg: command.birthWeightKg,
      birthLengthCm: command.birthLengthCm,
      gestationalAgeWeeks: command.gestationalAgeWeeks,
      notes: command.notes,
    });
    return map(result, toChildDto);
  }
}
