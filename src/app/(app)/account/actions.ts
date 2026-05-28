"use server";

import { revalidateTag } from "next/cache";

import type { UserProfileDto } from "@/application/account/dtos";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { type Result, err } from "@/domain/shared/result";
import { makeUseCases } from "@/composition";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { getLogger } from "@/infrastructure/logger/pino-logger";
import { profileTag } from "@/lib/account-cache";
import { requireServerSession } from "@/lib/server-session";
import { updateProfilePreferencesInputSchema } from "@/schemas/account";

import type { UpdateProfileFormState } from "./_lib/update-profile-state";
import type { UpdateAvatarFormState } from "./_lib/update-avatar-state";

function toFormState(
  result: Result<UserProfileDto, AppError>,
): UpdateProfileFormState {
  if (result.ok) {
    return { ok: true, profile: result.value };
  }
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;
  return fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };
}

function validationFromFlatten(
  fieldErrors: Record<string, readonly string[] | undefined>,
): UpdateProfileFormState {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  return toFormState(
    err(AppErrors.validation("Periksa kembali isian Anda.", cleaned)),
  );
}

/**
 * Persist the editable preferences from `/account`. Returns a structured
 * result so the client form can show field-level errors and a global banner
 * without throwing across the action boundary (project guidelines §14).
 *
 * On success the cache tag `user:{userId}:profile` is revalidated so any
 * downstream Server Component (notably the floating header) sees the new
 * display name on the next render.
 */
export async function updateProfile(
  _previous: UpdateProfileFormState | null,
  formData: FormData,
): Promise<UpdateProfileFormState> {
  const session = await requireServerSession();

  const parsed = updateProfilePreferencesInputSchema.safeParse({
    displayName: formData.get("displayName"),
    themePreference: formData.get("themePreference"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createSupabaseServerClient();
  const { updateUserProfile } = makeUseCases(supabase);
  const result = await updateUserProfile.execute({
    userId: session.userId,
    displayName: parsed.data.displayName,
    themePreference: parsed.data.themePreference,
    locale: parsed.data.locale,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(profileTag(session.userId), "max");
  return { ok: true, profile: result.value };
}

/**
 * Replace or clear the signed-in user's avatar. Uses the regular session
 * Supabase client so the upload runs under the user's JWT against the
 * `users/{auth.uid}/...` RLS policy. The previous avatar (if any) is
 * best-effort deleted by the use case.
 */
export async function updateAvatar(
  _previous: UpdateAvatarFormState | null,
  formData: FormData,
): Promise<UpdateAvatarFormState> {
  const session = await requireServerSession();
  const supabase = await createSupabaseServerClient();
  const { getCurrentProfile, updateUserAvatar } = makeUseCases(supabase);

  const currentResult = await getCurrentProfile.execute(session.userId);
  if (!currentResult.ok) {
    return { ok: false, message: currentResult.error.message };
  }
  const previousAvatarUrl = currentResult.value.avatarUrl;

  const action = formData.get("action");
  if (action === "clear") {
    const result = await updateUserAvatar.execute({
      kind: "clear",
      userId: session.userId,
      previousAvatarUrl,
    });
    if (!result.ok) return { ok: false, message: result.error.message };
    revalidateTag(profileTag(session.userId), "max");
    return { ok: true, profile: result.value };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "File foto wajib disertakan." };
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (cause) {
    getLogger().warn("updateAvatar: failed to read file body", {
      message: cause instanceof Error ? cause.message : String(cause),
    });
    return { ok: false, message: "File foto tidak terbaca. Coba lagi." };
  }

  const result = await updateUserAvatar.execute({
    kind: "replace",
    userId: session.userId,
    previousAvatarUrl,
    bytes,
    ...(file.type ? { claimedMime: file.type } : {}),
  });

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  revalidateTag(profileTag(session.userId), "max");
  return { ok: true, profile: result.value };
}
