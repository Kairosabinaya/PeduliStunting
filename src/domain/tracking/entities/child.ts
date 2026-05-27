import type { ChildId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { Sex } from "../value-objects/sex";

export class Child {
  readonly id: ChildId;
  readonly userId: UserId;
  readonly name: string;
  readonly sex: Sex;
  readonly birthDate: DateOnly;
  readonly birthWeightKg: number | null;
  readonly birthLengthCm: number | null;
  readonly gestationalAgeWeeks: number | null;
  readonly notes: string | null;
  readonly deletedAt: Date | null;

  constructor(props: {
    id: ChildId;
    userId: UserId;
    name: string;
    sex: Sex;
    birthDate: DateOnly;
    birthWeightKg: number | null;
    birthLengthCm: number | null;
    gestationalAgeWeeks: number | null;
    notes: string | null;
    deletedAt: Date | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.sex = props.sex;
    this.birthDate = props.birthDate;
    this.birthWeightKg = props.birthWeightKg;
    this.birthLengthCm = props.birthLengthCm;
    this.gestationalAgeWeeks = props.gestationalAgeWeeks;
    this.notes = props.notes;
    this.deletedAt = props.deletedAt;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
