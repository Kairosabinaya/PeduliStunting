import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type {
  NutritionEventData,
  NutritionEventKind,
} from "@/domain/health-plan/entities/nutrition-event";
import type { NutritionEventRepository } from "@/domain/health-plan/ports/nutrition-event-repository";
import { toNutritionEventDto, type NutritionEventDto } from "../dtos";

export interface RecordNutritionEventCommand {
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly kind: NutritionEventKind;
  readonly eventDate: DateOnly;
  readonly data: NutritionEventData;
  readonly note: string | null;
}

/**
 * Mencatat satu peristiwa gizi (mis. menandai ASI eksklusif, mencatat
 * pemberian kapsul Vit A). Upsert berdasarkan kunci konflik
 * `(child_id, kind, event_date)` — tanggal yang berbeda menghasilkan
 * baris baru sehingga histori tetap utuh, pengulangan di tanggal yang
 * sama memperbarui payload + note.
 */
export class RecordNutritionEventUseCase {
  constructor(private readonly repository: NutritionEventRepository) {}

  async execute(
    command: RecordNutritionEventCommand,
  ): Promise<Result<NutritionEventDto, AppError>> {
    const result = await this.repository.upsert({
      userId: command.userId,
      childId: command.childId,
      kind: command.kind,
      eventDate: command.eventDate,
      data: command.data,
      note: command.note,
    });
    return map(result, toNutritionEventDto);
  }
}
