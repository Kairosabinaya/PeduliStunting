/**
 * Discriminated state shape returned by the `softDeleteChild` Server Action.
 * Lives outside the `"use server"` module so a Client Component may import it
 * (Next forbids non-async exports from a server-actions module). On success the
 * action redirects to the tracker home, so a non-null state only ever carries
 * the failure case.
 */
export interface DeleteChildFormState {
  readonly ok: boolean;
  readonly message?: string;
}

/** Stable initial value passed to `useActionState`. */
export const INITIAL_DELETE_CHILD_STATE: DeleteChildFormState | null = null;
