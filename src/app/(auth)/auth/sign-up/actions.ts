"use server";

import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, type Result } from "@/domain/shared/result";
import { makeAdminUseCases } from "@/composition";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server-client";
import { getLogger } from "@/infrastructure/logger/pino-logger";

export interface UploadPendingAvatarResult {
  readonly ok: boolean;
  readonly message?: string;
  readonly pendingPath?: string;
  readonly publicUrl?: string;
}

/**
 * In-process rate limit: a Map keyed on caller IP -> {count, resetAt}.
 * Stops the same browser hammering the upload endpoint while the proper
 * Upstash-backed limiter is wired up (tracked in STATE.md known-limits).
 * It is intentionally a soft fallback — sufficient to deter casual abuse
 * during the MVP but not durable across function instances.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const buckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

function toResult(
  result: Result<unknown, AppError>,
): UploadPendingAvatarResult {
  if (result.ok) return { ok: true };
  return { ok: false, message: result.error.message };
}

/**
 * Server Action: receives an avatar file via FormData (`file` field) and
 * stores it in the `_signup/` pending folder via the service-role admin
 * client. Returns the storage path so the sign-up form can include it
 * alongside the rest of the payload (see ADR-0008 for why this runs
 * elevated).
 *
 * The action is anonymous (no session yet), so input validation +
 * rate-limit + size cap + MIME magic-byte sniff are the only barriers
 * between the public Internet and our Storage bucket. They are all
 * enforced inside `UploadPendingAvatarUseCase` and the `AvatarFileSchema`.
 */
export async function uploadPendingAvatar(
  _previous: UploadPendingAvatarResult | null,
  formData: FormData,
): Promise<UploadPendingAvatarResult> {
  const ipHeader = formData.get("__rate_key");
  const rateKey =
    typeof ipHeader === "string" && ipHeader.length > 0 ? ipHeader : "anon";
  if (isRateLimited(rateKey)) {
    return {
      ok: false,
      message:
        "Terlalu banyak permintaan unggah. Coba lagi dalam beberapa menit.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return toResult(err(AppErrors.validation("File foto wajib disertakan.")));
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (cause) {
    getLogger().warn("uploadPendingAvatar: failed to read file body", {
      message: cause instanceof Error ? cause.message : String(cause),
    });
    return toResult(
      err(AppErrors.validation("File foto tidak terbaca. Coba lagi.")),
    );
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (cause) {
    getLogger().error("uploadPendingAvatar: admin client unavailable", {
      message: cause instanceof Error ? cause.message : String(cause),
    });
    return {
      ok: false,
      message:
        "Layanan upload sedang tidak tersedia. Silakan coba beberapa saat lagi.",
    };
  }

  const { uploadPendingAvatar: useCase } = makeAdminUseCases(admin);
  const result = await useCase.execute({
    bytes,
    ...(file.type ? { claimedMime: file.type } : {}),
  });

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  return {
    ok: true,
    pendingPath: result.value.path,
    publicUrl: result.value.publicUrl,
  };
}
