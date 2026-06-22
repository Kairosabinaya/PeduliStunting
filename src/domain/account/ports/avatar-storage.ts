import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";

/**
 * Port for avatar storage operations. Concrete implementations live in
 * `/src/infrastructure/supabase/account/` and are wired through the
 * composition root. The port intentionally exposes only the three
 * operations the use cases need — uploading to the pre-signup pending
 * folder, uploading under an authenticated user's folder, and deleting
 * a specific object — keeping it ISP-compliant.
 */
export interface AvatarStoragePort {
  /**
   * Uploads avatar bytes to the `_signup/{uuid}.{ext}` pending folder
   * using elevated credentials. Used by `uploadPendingAvatar`, invoked
   * from the anonymous Server Action that runs before the user has a
   * Supabase session (email verification has not happened yet — see
   * ADR-0008).
   */
  uploadPending(input: {
    bytes: Uint8Array;
    contentType: "image/jpeg" | "image/png" | "image/webp";
  }): Promise<
    Result<{ readonly path: string; readonly publicUrl: string }, AppError>
  >;

  /**
   * Uploads avatar bytes to `users/{userId}/avatar.{ext}` using the
   * caller's authenticated session. Used by the post-sign-in
   * `updateUserAvatar` flow on `/account`.
   */
  uploadForUser(input: {
    userId: UserId;
    bytes: Uint8Array;
    contentType: "image/jpeg" | "image/png" | "image/webp";
  }): Promise<
    Result<{ readonly path: string; readonly publicUrl: string }, AppError>
  >;

  /**
   * Removes a single object from the avatars bucket. Used to clean up
   * the previous avatar when a user replaces or clears theirs.
   */
  remove(path: string): Promise<Result<void, AppError>>;
}
