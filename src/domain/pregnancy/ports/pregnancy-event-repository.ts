import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type {
  PregnancyEvent,
  PregnancyEventData,
  PregnancyEventKind,
} from "../entities/pregnancy-event";

export interface PregnancyEventRepository {
  listByPregnancy(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<readonly PregnancyEvent[], AppError>>;

  upsert(input: {
    userId: UserId;
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
    data: PregnancyEventData;
    note: string | null;
  }): Promise<Result<PregnancyEvent, AppError>>;

  delete(input: {
    userId: UserId;
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
  }): Promise<Result<void, AppError>>;
}
