import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { GrowthMeasurementRepository } from "@/domain/tracking/ports/growth-measurement-repository";
import { toGrowthMeasurementDto, type GrowthMeasurementDto } from "../dtos";

export class ListMeasurementsByChildUseCase {
  constructor(private readonly repository: GrowthMeasurementRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly GrowthMeasurementDto[], AppError>> {
    const result = await this.repository.listByChild(userId, childId);
    return map(result, (rows) => rows.map(toGrowthMeasurementDto));
  }
}
