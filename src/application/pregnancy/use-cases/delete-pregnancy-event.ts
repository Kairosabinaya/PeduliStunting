import type { Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { PregnancyEventKind } from "@/domain/pregnancy/entities/pregnancy-event";
import type { PregnancyEventRepository } from "@/domain/pregnancy/ports/pregnancy-event-repository";

export interface DeletePregnancyEventCommand {
  readonly userId: UserId;
  readonly pregnancyId: PregnancyId;
  readonly kind: PregnancyEventKind;
  readonly eventDate: DateOnly;
}

export class DeletePregnancyEventUseCase {
  constructor(private readonly repository: PregnancyEventRepository) {}

  async execute(
    command: DeletePregnancyEventCommand,
  ): Promise<Result<void, AppError>> {
    return this.repository.delete({
      userId: command.userId,
      pregnancyId: command.pregnancyId,
      kind: command.kind,
      eventDate: command.eventDate,
    });
  }
}
