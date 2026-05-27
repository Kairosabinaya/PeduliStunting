import type { ChildMilestoneDto } from "@/application/health-plan/dtos";

export interface UpsertMilestoneFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly record?: ChildMilestoneDto;
}

export const INITIAL_UPSERT_MILESTONE_STATE: UpsertMilestoneFormState | null =
  null;
