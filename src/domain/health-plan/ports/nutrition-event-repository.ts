import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type {
  NutritionEvent,
  NutritionEventData,
  NutritionEventKind,
} from "../entities/nutrition-event";

export interface NutritionEventRepository {
  listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly NutritionEvent[], AppError>>;

  /**
   * Upsert satu peristiwa nutrisi. Key konflik = `(child_id, kind,
   * event_date)`, sehingga peristiwa di tanggal yang berbeda menjadi baris
   * baru (mempertahankan histori); pengulangan pada tanggal yang sama
   * memperbarui `data` + `note`.
   */
  upsert(input: {
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
    data: NutritionEventData;
    note: string | null;
  }): Promise<Result<NutritionEvent, AppError>>;

  /**
   * Hapus satu peristiwa nutrisi milik user. Dipakai saat orang tua keliru
   * mencatat kapsul Vit A / dosis cacing dan ingin mengoreksinya.
   */
  delete(input: {
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
  }): Promise<Result<void, AppError>>;
}
