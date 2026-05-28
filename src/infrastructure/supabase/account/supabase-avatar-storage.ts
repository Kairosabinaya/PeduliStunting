import "server-only";

import { randomUUID } from "node:crypto";

import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import type { UserId } from "@/domain/shared/ids";
import type { AvatarStoragePort } from "@/domain/account/ports/avatar-storage";
import { getLogger } from "@/infrastructure/logger/pino-logger";
import {
  AVATAR_PENDING_PREFIX,
  AVATAR_USER_PREFIX,
  extensionForMime,
  type AvatarMimeType,
} from "@/schemas/avatar";

import type { TypedSupabaseClient } from "../server-client";
import { mapUnknownInfrastructureError } from "../error-mapping";

const BUCKET_ID = "avatars";

/**
 * Supabase Storage implementation of {@link AvatarStoragePort}. Caller
 * decides which Supabase client to inject:
 *
 *  - `createSupabaseAdminClient()` for {@link uploadPending} (no session
 *    yet during sign-up — service role required, isolated to ADR-0008).
 *  - `createSupabaseServerClient()` for {@link uploadForUser} (session
 *    JWT enforces the `users/{auth.uid}/...` RLS policy).
 *
 * The infrastructure layer is the only place where the storage SDK leaks;
 * use cases see only the `AvatarStoragePort` contract.
 */
export class SupabaseAvatarStorage implements AvatarStoragePort {
  constructor(private readonly client: TypedSupabaseClient) {}

  async uploadPending(input: {
    bytes: Uint8Array;
    contentType: AvatarMimeType;
  }): Promise<
    Result<{ readonly path: string; readonly publicUrl: string }, AppError>
  > {
    const filename = `${randomUUID()}.${extensionForMime(input.contentType)}`;
    const path = `${AVATAR_PENDING_PREFIX}${filename}`;
    return this.uploadAt(path, input.bytes, input.contentType);
  }

  async uploadForUser(input: {
    userId: UserId;
    bytes: Uint8Array;
    contentType: AvatarMimeType;
  }): Promise<
    Result<{ readonly path: string; readonly publicUrl: string }, AppError>
  > {
    const filename = `${randomUUID()}.${extensionForMime(input.contentType)}`;
    const path = `${AVATAR_USER_PREFIX}${input.userId}/${filename}`;
    return this.uploadAt(path, input.bytes, input.contentType);
  }

  async remove(path: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.client.storage
        .from(BUCKET_ID)
        .remove([path]);
      if (error) {
        getLogger().warn("Avatar remove failed (non-fatal)", {
          path,
          message: error.message,
        });
        return err(
          AppErrors.externalService(
            "Tidak bisa menghapus avatar lama.",
            "supabase-storage",
            error,
          ),
        );
      }
      return ok(undefined);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "avatars.remove"));
    }
  }

  private async uploadAt(
    path: string,
    bytes: Uint8Array,
    contentType: AvatarMimeType,
  ): Promise<
    Result<{ readonly path: string; readonly publicUrl: string }, AppError>
  > {
    try {
      const { error } = await this.client.storage
        .from(BUCKET_ID)
        .upload(path, bytes, {
          contentType,
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        getLogger().error("Avatar upload failed", {
          path,
          message: error.message,
        });
        return err(
          AppErrors.externalService(
            "Tidak bisa mengunggah foto. Coba lagi.",
            "supabase-storage",
            error,
          ),
        );
      }
      const { data } = this.client.storage.from(BUCKET_ID).getPublicUrl(path);
      return ok({ path, publicUrl: data.publicUrl });
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "avatars.upload"));
    }
  }
}
