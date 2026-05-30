import type { Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { NutritionEventKind } from "@/domain/health-plan/entities/nutrition-event";
import type { NutritionEventRepository } from "@/domain/health-plan/ports/nutrition-event-repository";

export interface DeleteNutritionEventCommand {
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly kind: NutritionEventKind;
  readonly eventDate: DateOnly;
}

/**
 * Menghapus satu peristiwa gizi milik user. Dipakai saat orang tua keliru
 * mencatat (mis. salah tanggal pemberian Vit A) dan ingin mengoreksinya.
 */
export class DeleteNutritionEventUseCase {
  constructor(private readonly repository: NutritionEventRepository) {}

  async execute(
    command: DeleteNutritionEventCommand,
  ): Promise<Result<void, AppError>> {
    return this.repository.delete({
      userId: command.userId,
      childId: command.childId,
      kind: command.kind,
      eventDate: command.eventDate,
    });
  }
}
