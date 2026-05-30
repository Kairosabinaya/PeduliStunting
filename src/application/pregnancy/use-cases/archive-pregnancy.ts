import type { Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { PregnancyRepository } from "@/domain/pregnancy/ports/pregnancy-repository";

export class ArchivePregnancyUseCase {
  constructor(private readonly repository: PregnancyRepository) {}

  async execute(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<void, AppError>> {
    return this.repository.archive(userId, pregnancyId);
  }
}
