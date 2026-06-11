import type { ChildImmunizationDto } from "@/application/health-plan/dtos";

export interface UpsertImmunizationFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly record?: ChildImmunizationDto;
}

export const INITIAL_UPSERT_IMMUNIZATION_STATE: UpsertImmunizationFormState | null =
  null;
