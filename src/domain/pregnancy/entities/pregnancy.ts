import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";

export class Pregnancy {
  readonly id: PregnancyId;
  readonly userId: UserId;
  /** Hari Pertama Haid Terakhir — basis perhitungan usia kehamilan. */
  readonly hpht: DateOnly;
  readonly expectedDue: DateOnly | null;
  readonly initialWeightKg: number | null;
  readonly heightCm: number | null;
  readonly notes: string | null;
  readonly archivedAt: string | null;

  constructor(props: {
    id: PregnancyId;
    userId: UserId;
    hpht: DateOnly;
    expectedDue: DateOnly | null;
    initialWeightKg: number | null;
    heightCm: number | null;
    notes: string | null;
    archivedAt: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.hpht = props.hpht;
    this.expectedDue = props.expectedDue;
    this.initialWeightKg = props.initialWeightKg;
    this.heightCm = props.heightCm;
    this.notes = props.notes;
    this.archivedAt = props.archivedAt;
  }
}
