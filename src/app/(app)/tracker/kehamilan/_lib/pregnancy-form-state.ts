import type {
  PregnancyDto,
  PregnancyEventDto,
} from "@/application/pregnancy/dtos";

export interface PregnancyProfileFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly record?: PregnancyDto;
}

export interface PregnancyEventFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly record?: PregnancyEventDto;
}

export const INITIAL_PREGNANCY_PROFILE_STATE: PregnancyProfileFormState | null =
  null;

export const INITIAL_PREGNANCY_EVENT_STATE: PregnancyEventFormState | null =
  null;
