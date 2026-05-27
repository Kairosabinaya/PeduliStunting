import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { MilestoneRepository } from "@/domain/health-plan/ports/milestone-repository";
import { toMilestoneDto, type MilestoneDto } from "../dtos";

export class ListMilestonesUseCase {
  constructor(private readonly repository: MilestoneRepository) {}

  async execute(): Promise<Result<readonly MilestoneDto[], AppError>> {
    const result = await this.repository.list();
    return map(result, (rows) => rows.map(toMilestoneDto));
  }
}
