import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, type Result } from "@/domain/shared/result";
import type { AvatarStoragePort } from "@/domain/account/ports/avatar-storage";
import { AvatarFileSchema } from "@/schemas/avatar";

export interface UploadPendingAvatarCommand {
  readonly bytes: Uint8Array;
  readonly claimedMime?: string;
}

export interface UploadPendingAvatarOutput {
  readonly path: string;
  readonly publicUrl: string;
}

/**
 * Validates an avatar uploaded by an anonymous visitor during sign-up and
 * persists it to the `_signup/` folder via the elevated storage port.
 * Returns the pending path so the sign-up form can include it in its
 * submission and the `signUpWithPassword` action can promote it to a
 * user-owned avatar through trigger-driven metadata.
 *
 * The use case never throws — invalid bytes or storage failures are
 * surfaced as `Result<_, AppError>` per project guidelines §12.
 */
export class UploadPendingAvatarUseCase {
  constructor(private readonly storage: AvatarStoragePort) {}

  async execute(
    command: UploadPendingAvatarCommand,
  ): Promise<Result<UploadPendingAvatarOutput, AppError>> {
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

    return this.storage.uploadPending({
      bytes: parsed.data.bytes,
      contentType: parsed.data.mime,
    });
  }
}
