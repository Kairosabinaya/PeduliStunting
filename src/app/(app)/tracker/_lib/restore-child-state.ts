/**
 * Result shape of the `restoreChild` Server Action (the undo path for
 * `softDeleteChild`). Lives outside the `"use server"` module so a Client
 * Component may import the type. The action is invoked imperatively from a
 * toast action button, not through `useActionState`, so the shape is a plain
 * tagged result rather than a form state.
 */
export type RestoreChildResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };
