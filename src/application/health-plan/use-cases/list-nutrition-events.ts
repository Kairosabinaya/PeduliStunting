import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { NutritionEventRepository } from "@/domain/health-plan/ports/nutrition-event-repository";
import { toNutritionEventDto, type NutritionEventDto } from "../dtos";

export class ListNutritionEventsByChildUseCase {
  constructor(private readonly repository: NutritionEventRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly NutritionEventDto[], AppError>> {
    const result = await this.repository.listByChild(userId, childId);
    return map(result, (items) => items.map(toNutritionEventDto));
  }
}
