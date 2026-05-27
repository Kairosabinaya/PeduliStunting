import type { GrowthMeasurementDto } from "@/application/tracking/dtos";

export interface AddMeasurementFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly measurement?: GrowthMeasurementDto;
}

export const INITIAL_ADD_MEASUREMENT_STATE: AddMeasurementFormState | null =
  null;
