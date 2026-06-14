/**
 * Discriminated state shape returned by the `softDeleteChild` Server Action.
 * Lives outside the `"use server"` module so a Client Component may import it
 * (Next forbids non-async exports from a server-actions module).
 *
 * The action no longer redirects on success: the client island needs to fire
 * an undo toast (Shneiderman rule 6) and navigate itself, so success returns
 * `{ ok: true }` and the client drives the rest. `useActionState` hands back a
 * fresh object on every completed call, so an effect keyed on the state
 * re-fires the toast even when the same child is deleted twice in a session.
 */
export type DeleteChildFormState =
  | { readonly ok: true }
  | { readonly ok: false; readonly message?: string };

/** Stable initial value passed to `useActionState`. */
export const INITIAL_DELETE_CHILD_STATE: DeleteChildFormState | null = null;
