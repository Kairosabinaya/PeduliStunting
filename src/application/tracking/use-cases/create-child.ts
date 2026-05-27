import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";
import type { Sex } from "@/domain/tracking/value-objects/sex";
import { toChildDto, type ChildDto } from "../dtos";

export interface CreateChildCommand {
  readonly userId: UserId;
  readonly name: string;
  readonly sex: Sex;
  readonly birthDate: DateOnly;
  readonly birthWeightKg: number | null;
  readonly birthLengthCm: number | null;
  readonly gestationalAgeWeeks: number | null;
  readonly notes: string | null;
}

export class CreateChildUseCase {
  constructor(private readonly repository: ChildRepository) {}

  async execute(
    command: CreateChildCommand,
  ): Promise<Result<ChildDto, AppError>> {
    const result = await this.repository.create({
      userId: command.userId,
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
