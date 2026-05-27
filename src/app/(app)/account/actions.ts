"use server";

import { revalidateTag } from "next/cache";

import type { UserProfileDto } from "@/application/account/dtos";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { type Result, err } from "@/domain/shared/result";
import { makeUseCases } from "@/composition";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { profileTag } from "@/lib/account-cache";
import { requireServerSession } from "@/lib/server-session";
import { updateProfilePreferencesInputSchema } from "@/schemas/account";

import type { UpdateProfileFormState } from "./_lib/update-profile-state";

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
