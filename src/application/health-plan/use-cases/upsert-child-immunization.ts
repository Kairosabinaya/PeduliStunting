import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, ImmunizationCode, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { ChildImmunizationRepository } from "@/domain/health-plan/ports/child-immunization-repository";
import type { ChildImmunizationStatus } from "@/domain/health-plan/entities/child-immunization";
import { toChildImmunizationDto, type ChildImmunizationDto } from "../dtos";

export interface UpsertChildImmunizationCommand {
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly immunizationCode: ImmunizationCode;
  readonly status: ChildImmunizationStatus;
  readonly givenAt: DateOnly | null;
  readonly note: string | null;
}

export class UpsertChildImmunizationUseCase {
  constructor(private readonly repository: ChildImmunizationRepository) {}

  async execute(
    command: UpsertChildImmunizationCommand,
  ): Promise<Result<ChildImmunizationDto, AppError>> {
    const result = await this.repository.upsertStatus({
      userId: command.userId,
      childId: command.childId,
      immunizationCode: command.immunizationCode,
      status: command.status,
      givenAt: command.givenAt,
      note: command.note,
    });
    return map(result, toChildImmunizationDto);
  }
}
