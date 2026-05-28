/**
 * State returned by the `deleteUserAccountAction` Server Action. Lives
 * outside the `"use server"` boundary so Client Components can import
 * the shape — Next.js refuses to export anything but async functions
 * from a server-actions module.
 */
export interface DeleteUserAccountFormState {
  readonly ok: boolean;
  readonly message?: string;
}

export const INITIAL_DELETE_USER_STATE: DeleteUserAccountFormState | null =
  null;
