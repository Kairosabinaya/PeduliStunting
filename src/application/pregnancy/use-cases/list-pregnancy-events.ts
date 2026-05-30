import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { PregnancyEventRepository } from "@/domain/pregnancy/ports/pregnancy-event-repository";
import { toPregnancyEventDto, type PregnancyEventDto } from "../dtos";

export class ListPregnancyEventsUseCase {
  constructor(private readonly repository: PregnancyEventRepository) {}

  async execute(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<readonly PregnancyEventDto[], AppError>> {
    const result = await this.repository.listByPregnancy(userId, pregnancyId);
    return map(result, (items) => items.map(toPregnancyEventDto));
  }
}
