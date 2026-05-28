import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, type Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";
import type { AvatarStoragePort } from "@/domain/account/ports/avatar-storage";
import type { UserProfileRepository } from "@/domain/account/ports/user-profile-repository";
import { AvatarFileSchema } from "@/schemas/avatar";
import { toUserProfileDto, type UserProfileDto } from "../dtos";

export type UpdateUserAvatarCommand =
  | {
      readonly kind: "replace";
      readonly userId: UserId;
      readonly previousAvatarUrl: string | null;
      readonly bytes: Uint8Array;
      readonly claimedMime?: string;
    }
  | {
      readonly kind: "clear";
      readonly userId: UserId;
      readonly previousAvatarUrl: string | null;
    };

/**
 * Replace or clear the avatar for an authenticated user. Used by the
 * `/account` page after the user is signed in (no service-role escape
 * hatch — the storage port uses the user's session against the
 * `users/{auth.uid}/...` policy).
 *
 * The previous avatar is best-effort deleted after the new one is
 * persisted; a storage error there is logged inside the port but does
 * not roll back the profile update because the profile row is the
 * source of truth for what we render.
 */
export class UpdateUserAvatarUseCase {
  constructor(
    private readonly profiles: UserProfileRepository,
    private readonly storage: AvatarStoragePort,
  ) {}

  async execute(
    command: UpdateUserAvatarCommand,
  ): Promise<Result<UserProfileDto, AppError>> {
    if (command.kind === "clear") {
      const updated = await this.profiles.updateAvatar({
        userId: command.userId,
        avatarUrl: null,
      });
      if (!updated.ok) return updated;
      if (command.previousAvatarUrl) {
        const path = extractStoragePath(command.previousAvatarUrl);
        if (path) await this.storage.remove(path);
      }
      return { ok: true, value: toUserProfileDto(updated.value) };
    }

    const parsed = AvatarFileSchema.safeParse({
      bytes: command.bytes,
      claimedMime: command.claimedMime,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, readonly string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]?.toString() ?? "bytes";
        const prev = fieldErrors[path] ?? [];
        fieldErrors[path] = [...prev, issue.message];
      }
      return err(AppErrors.validation("Foto tidak valid.", fieldErrors));
    }

    const upload = await this.storage.uploadForUser({
      userId: command.userId,
      bytes: parsed.data.bytes,
      contentType: parsed.data.mime,
    });
    if (!upload.ok) return upload;

    const updated = await this.profiles.updateAvatar({
      userId: command.userId,
      avatarUrl: upload.value.publicUrl,
    });
    if (!updated.ok) return updated;

    if (
      command.previousAvatarUrl &&
      command.previousAvatarUrl !== upload.value.publicUrl
    ) {
      const path = extractStoragePath(command.previousAvatarUrl);
      if (path) await this.storage.remove(path);
    }

    return { ok: true, value: toUserProfileDto(updated.value) };
  }
}

/**
 * Extract the bucket-relative storage path from a public avatars URL.
 * Returns `null` for URLs that don't point at our Storage bucket so we
 * never accidentally delete something belonging elsewhere.
 */
function extractStoragePath(publicUrl: string): string | null {
  const marker = "/storage/v1/object/public/avatars/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const path = publicUrl.slice(idx + marker.length);
  return path.length > 0 ? path : null;
}
