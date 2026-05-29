import type { ImmunizationCode } from "@/domain/shared/ids";

export class Immunization {
  readonly code: ImmunizationCode;
  readonly name: string;
  readonly doseNumber: number | null;
  readonly recommendedAgeMonths: number | null;
  readonly notes: string | null;
  readonly prevents: string | null;
  readonly displayOrder: number;

  constructor(props: {
    code: ImmunizationCode;
    name: string;
    doseNumber: number | null;
    recommendedAgeMonths: number | null;
    notes: string | null;
    prevents: string | null;
    displayOrder: number;
  }) {
    this.code = props.code;
    this.name = props.name;
    this.doseNumber = props.doseNumber;
    this.recommendedAgeMonths = props.recommendedAgeMonths;
    this.notes = props.notes;
    this.prevents = props.prevents;
    this.displayOrder = props.displayOrder;
  }
}
