import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ImmunizationRepository } from "@/domain/health-plan/ports/immunization-repository";
import { toImmunizationDto, type ImmunizationDto } from "../dtos";

export class ListImmunizationScheduleUseCase {
  constructor(private readonly repository: ImmunizationRepository) {}

  async execute(): Promise<Result<readonly ImmunizationDto[], AppError>> {
    const result = await this.repository.listSchedule();
    return map(result, (rows) => rows.map(toImmunizationDto));
  }
}
