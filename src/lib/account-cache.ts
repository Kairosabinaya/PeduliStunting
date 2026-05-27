import "server-only";

import { cache } from "react";

import type { UserProfileDto } from "@/application/account/dtos";
import { makeUseCases } from "@/composition";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

/**
 * Cache tag for a single user's profile snapshot. Keep the format
 * `user:{userId}:profile` so it matches the convention documented in
 * STATE.md §5.2 and §5.3 (mutators that change the profile call
 * `revalidateTag(profileTag(userId))`).
 */
export function profileTag(userId: string): string {
  return `user:${userId}:profile`;
}

/**
 * Per-request memoised fetch of the current user's profile. React's `cache`
 * deduplicates calls within the same Server-Component render tree, so the
 * floating-header and the account page (both fetching the same profile in
 * the same request) only hit Supabase once.
 *
 * The Supabase client is request-scoped (cookie-bound) and therefore created
 * inside the cached function rather than passed in. For cross-request
 * invalidation Server Actions call `revalidateTag(profileTag(userId))` after
 * updating the row; on `dynamic` routes the next render then re-enters this
 * function with a fresh client.
 */
export const fetchCurrentProfile = cache(
  async (userId: UserId): Promise<Result<UserProfileDto, AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).getCurrentProfile.execute(userId);
  },
);
