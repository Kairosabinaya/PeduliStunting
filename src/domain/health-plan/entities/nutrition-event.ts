import type { ChildId, NutritionEventId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";

/**
 * Jenis catatan gizi yang dilacak Phase 5. Sumber: Buku KIA 2024.
 *
 *   - `asi_exclusive`   : status ASI eksklusif (0-6 bln). Data: `{ exclusive: bool }`.
 *   - `mpasi_started`   : tanggal mulai MPASI (idealnya 6 bln). Data: `{}`.
 *   - `vit_a_blue`      : kapsul biru 100.000 IU (6-11 bln, 1x). Data: `{}`.
 *   - `vit_a_red_feb`   : kapsul merah 200.000 IU Februari (12-59 bln). Data: `{}`.
 *   - `vit_a_red_aug`   : kapsul merah 200.000 IU Agustus (12-59 bln). Data: `{}`.
 *   - `deworming`       : obat cacing (1-6 th, 2x/tahun). Data: `{}`.
 */
export const NUTRITION_EVENT_KINDS = [
  "asi_exclusive",
  "mpasi_started",
  "vit_a_blue",
  "vit_a_red_feb",
  "vit_a_red_aug",
  "deworming",
] as const;

export type NutritionEventKind = (typeof NUTRITION_EVENT_KINDS)[number];

/**
 * Payload bebas-skema per kind. Domain hanya mengetahui bentuk dasar; lapisan
 * presentasi membaca field yang relevan (mis. `data.exclusive` untuk ASI).
 */
export type NutritionEventData = Readonly<Record<string, unknown>>;

export class NutritionEvent {
  readonly id: NutritionEventId;
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly kind: NutritionEventKind;
  readonly eventDate: DateOnly;
  readonly data: NutritionEventData;
  readonly note: string | null;

  constructor(props: {
    id: NutritionEventId;
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
    data: NutritionEventData;
    note: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.childId = props.childId;
    this.kind = props.kind;
    this.eventDate = props.eventDate;
    this.data = props.data;
    this.note = props.note;
  }
}
