import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type {
  PregnancyEventData,
  PregnancyEventKind,
} from "@/domain/pregnancy/entities/pregnancy-event";
import type { PregnancyEventRepository } from "@/domain/pregnancy/ports/pregnancy-event-repository";
import { toPregnancyEventDto, type PregnancyEventDto } from "../dtos";

export interface RecordPregnancyEventCommand {
  readonly userId: UserId;
  readonly pregnancyId: PregnancyId;
  readonly kind: PregnancyEventKind;
  readonly eventDate: DateOnly;
  readonly data: PregnancyEventData;
  readonly note: string | null;
}

export class RecordPregnancyEventUseCase {
  constructor(private readonly repository: PregnancyEventRepository) {}

  async execute(
    command: RecordPregnancyEventCommand,
  ): Promise<Result<PregnancyEventDto, AppError>> {
    const result = await this.repository.upsert({
      userId: command.userId,
      pregnancyId: command.pregnancyId,
      kind: command.kind,
      eventDate: command.eventDate,
      data: command.data,
      note: command.note,
    });
    return map(result, toPregnancyEventDto);
  }
}
