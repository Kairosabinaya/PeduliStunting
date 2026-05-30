import { err, map, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { UserId } from "@/domain/shared/ids";
import type { PregnancyRepository } from "@/domain/pregnancy/ports/pregnancy-repository";
import { toPregnancyDto, type PregnancyDto } from "../dtos";

export class GetActivePregnancyUseCase {
  constructor(private readonly repository: PregnancyRepository) {}

  async execute(
    userId: UserId,
  ): Promise<Result<PregnancyDto | null, AppError>> {
    const result = await this.repository.findActiveByUser(userId);
    if (!result.ok) return err(result.error);
    if (result.value === null) return ok(null);
    return map(result, (item) => (item ? toPregnancyDto(item) : null));
  }
}
