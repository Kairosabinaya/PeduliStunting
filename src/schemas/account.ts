// Side effect first: switches Zod to jitless mode so no client bundle that
// contains these schemas ever runs the CSP-violating eval probe.
import "@/lib/zod-jitless";

import { z } from "zod";

import type { Tables } from "@/types/supabase";
import { SUPPORTED_LOCALES } from "@/config/locales";
import { AppErrors, type ValidationError } from "@/domain/errors/app-error";
import { type Result, err, ok } from "@/domain/shared/result";
import { asUserId } from "@/domain/shared/ids";
import {
  THEME_PREFERENCES,
  USER_ROLES,
  UserProfile,
  type ThemePreference,
  type UserRole,
} from "@/domain/account/entities/user-profile";

/* ─────────────────────────── input parsing ─────────────────────────── */

export const userRoleSchema = z.enum(USER_ROLES);

export const themePreferenceSchema = z.enum(THEME_PREFERENCES);

/**
 * Permissive BCP-47 format check used when reading rows from the database.
 * Tolerates historical values that may not yet be present in
 * {@link SUPPORTED_LOCALES} so the app keeps starting up after a locale is
 * removed from the supported list.
 */
export const localeSchema = z
  .string()
  .min(2)
  .max(8)
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/u, "locale tidak valid (contoh: id, id-ID)");

/**
 * Strict locale validator used for user-facing inputs. Restricted to the
 * locales the UI actually offers via {@link SUPPORTED_LOCALES}; rejecting
 * unknown values prevents drift between the profile form and the
 * `i18n` runtime.
 */
export const inputLocaleSchema = z.enum(SUPPORTED_LOCALES);

export const DISPLAY_NAME_MIN_LENGTH = 1;
export const DISPLAY_NAME_MAX_LENGTH = 80;

const trimmedDisplayName = z
  .string()
  .trim()
  .min(DISPLAY_NAME_MIN_LENGTH, "Nama tampilan tidak boleh kosong.")
  .max(
    DISPLAY_NAME_MAX_LENGTH,
    `Nama tampilan maksimal ${String(DISPLAY_NAME_MAX_LENGTH)} karakter.`,
  );

export const displayNameSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}, trimmedDisplayName.nullable());

export const updateProfilePreferencesInputSchema = z
  .object({
    displayName: displayNameSchema,
    themePreference: themePreferenceSchema,
    locale: inputLocaleSchema,
  })
  .strict();

export type UpdateProfilePreferencesInput = z.infer<
  typeof updateProfilePreferencesInputSchema
>;

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type ProfileRow = Tables<"profiles">;

export function mapProfileRow(
  row: ProfileRow,
): Result<UserProfile, ValidationError> {
  const roleResult = userRoleSchema.safeParse(row.role);
  if (!roleResult.success) {
    return err(AppErrors.validation(`role tidak valid: ${row.role}`));
  }
  const themeResult = themePreferenceSchema.safeParse(row.theme_preference);
  if (!themeResult.success) {
    return err(
      AppErrors.validation(
        `theme_preference tidak valid: ${row.theme_preference}`,
      ),
    );
  }

  return ok(
    new UserProfile({
      userId: asUserId(row.user_id),
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      role: roleResult.data as UserRole,
      themePreference: themeResult.data as ThemePreference,
      locale: row.locale,
    }),
  );
}

/* ───────────────────────── avatar update input ───────────────────────── */

export const updateAvatarInputSchema = z
  .object({
    avatarUrl: z.string().url("Avatar URL tidak valid.").nullable(),
  })
  .strict();

export type UpdateAvatarInput = z.infer<typeof updateAvatarInputSchema>;
