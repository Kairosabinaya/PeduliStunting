import type { UserProfileDto } from "@/application/account/dtos";

/**
 * Discriminated state shape returned by the `updateProfile` Server Action.
 * Lives outside the `"use server"` boundary so it can be safely consumed by
 * Client Components — Next.js refuses to export anything but async functions
 * from a server-actions module.
 */
export interface UpdateProfileFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly profile?: UserProfileDto;
}

/**
 * Stable default for `useActionState`. Exposed as a typed value so the form
 * does not need to fabricate a placeholder.
 */
export const INITIAL_UPDATE_PROFILE_STATE: UpdateProfileFormState | null = null;
