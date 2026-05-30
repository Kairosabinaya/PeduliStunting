import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { PregnancyRepository } from "@/domain/pregnancy/ports/pregnancy-repository";
import { toPregnancyDto, type PregnancyDto } from "../dtos";

export interface UpsertPregnancyCommand {
  readonly userId: UserId;
  readonly pregnancyId: PregnancyId | null;
  readonly hpht: DateOnly;
  readonly expectedDue: DateOnly | null;
  readonly initialWeightKg: number | null;
  readonly heightCm: number | null;
  readonly notes: string | null;
}

/**
 * Create new pregnancy when `pregnancyId` is null, otherwise update existing.
 * MVP Phase 6 expects only one active pregnancy per user; calling code
 * decides between create vs update based on `findActiveByUser` outcome.
 */
export class UpsertPregnancyUseCase {
  constructor(private readonly repository: PregnancyRepository) {}

  async execute(
    command: UpsertPregnancyCommand,
  ): Promise<Result<PregnancyDto, AppError>> {
    if (command.pregnancyId === null) {
      const created = await this.repository.create({
        userId: command.userId,
        hpht: command.hpht,
        expectedDue: command.expectedDue,
        initialWeightKg: command.initialWeightKg,
        heightCm: command.heightCm,
        notes: command.notes,
      });
      return map(created, toPregnancyDto);
    }
    const updated = await this.repository.update({
      userId: command.userId,
      pregnancyId: command.pregnancyId,
      hpht: command.hpht,
      expectedDue: command.expectedDue,
      initialWeightKg: command.initialWeightKg,
      heightCm: command.heightCm,
      notes: command.notes,
    });
    return map(updated, toPregnancyDto);
  }
}
