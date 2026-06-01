import type { ChildDto } from "@/application/tracking/dtos";

/**
 * Discriminated state shape returned by the `createChild` Server Action. Lives
 * outside the `"use server"` module so a Client Component may import it (Next
 * forbids non-async exports from a server-actions module).
 */
export interface AddChildFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly child?: ChildDto;
  readonly payload?: Readonly<Record<string, string>>;
}

/** Stable initial value passed to `useActionState`. */
export const INITIAL_ADD_CHILD_STATE: AddChildFormState | null = null;
