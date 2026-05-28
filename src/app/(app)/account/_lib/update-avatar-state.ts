import type { UserProfileDto } from "@/application/account/dtos";

/**
 * Discriminated state shape returned by the `updateAvatar` Server Action.
 * Lives outside the `"use server"` boundary so it can be safely consumed
 * by Client Components — Next.js refuses to export anything but async
 * functions from a server-actions module.
 */
export interface UpdateAvatarFormState {
  readonly ok: boolean;
  readonly message?: string;
  readonly profile?: UserProfileDto;
}

export const INITIAL_UPDATE_AVATAR_STATE: UpdateAvatarFormState | null = null;
