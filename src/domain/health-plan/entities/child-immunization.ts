import type {
  ChildId,
  ChildImmunizationId,
  ImmunizationCode,
  UserId,
} from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";

export const CHILD_IMMUNIZATION_STATUSES = [
  "pending",
  "done",
  "skipped",
] as const;

export type ChildImmunizationStatus =
  (typeof CHILD_IMMUNIZATION_STATUSES)[number];

export class ChildImmunization {
  readonly id: ChildImmunizationId;
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly immunizationCode: ImmunizationCode;
  readonly status: ChildImmunizationStatus;
  readonly givenAt: DateOnly | null;
  readonly note: string | null;

  constructor(props: {
    id: ChildImmunizationId;
    userId: UserId;
    childId: ChildId;
    immunizationCode: ImmunizationCode;
    status: ChildImmunizationStatus;
    givenAt: DateOnly | null;
    note: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.childId = props.childId;
    this.immunizationCode = props.immunizationCode;
    this.status = props.status;
    this.givenAt = props.givenAt;
    this.note = props.note;
  }
}
