import type { NutritionEventDto } from "@/application/health-plan/dtos";

export interface NutritionFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly record?: NutritionEventDto;
}

export const INITIAL_NUTRITION_FORM_STATE: NutritionFormState | null = null;
