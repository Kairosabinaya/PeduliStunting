import type {
  PregnancyEventId,
  PregnancyId,
  UserId,
} from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";

/**
 * Jenis peristiwa kehamilan yang dilacak Phase 6.
 *
 *   - `anc_visit`          : kunjungan ANC. Data: `{ visit_number, by_doctor, has_usg }`.
 *   - `ttd_dose`           : pemberian Tablet Tambah Darah harian. Data: `{}`.
 *   - `weight_measurement` : pengukuran berat badan ibu. Data: `{ weight_kg: number }`.
 */
export const PREGNANCY_EVENT_KINDS = [
  "anc_visit",
  "ttd_dose",
  "weight_measurement",
] as const;

export type PregnancyEventKind = (typeof PREGNANCY_EVENT_KINDS)[number];

export type PregnancyEventData = Readonly<Record<string, unknown>>;

export class PregnancyEvent {
  readonly id: PregnancyEventId;
  readonly userId: UserId;
  readonly pregnancyId: PregnancyId;
  readonly kind: PregnancyEventKind;
  readonly eventDate: DateOnly;
  readonly data: PregnancyEventData;
  readonly note: string | null;

  constructor(props: {
    id: PregnancyEventId;
    userId: UserId;
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
    data: PregnancyEventData;
    note: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.pregnancyId = props.pregnancyId;
    this.kind = props.kind;
    this.eventDate = props.eventDate;
    this.data = props.data;
    this.note = props.note;
  }
}
