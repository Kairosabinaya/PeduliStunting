"use server";

import { redirect } from "next/navigation";

import { APP_URL } from "@/config/app";
import {
  CHECK_EMAIL_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
  SIGN_IN_ROUTE,
  SIGNED_OUT_REDIRECT_ROUTE,
  UPDATE_PASSWORD_ROUTE,
} from "@/config/routes";
import { env } from "@/config/env";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { mapSupabaseAuthError } from "@/lib/supabase-auth-error";
import {
  RequestPasswordResetSchema,
  ResendVerificationSchema,
  SignInSchema,
  SignUpSchema,
  UpdatePasswordSchema,
} from "@/schemas/auth";

export interface AuthActionResult {
  readonly ok: boolean;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly redirectTo?: string;
}

function toActionResult<T>(
  result: Result<T, AppError>,
  redirectTo?: string,
): AuthActionResult {
  if (result.ok) {
    return redirectTo ? { ok: true, redirectTo } : { ok: true };
  }
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;
  return fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };
}

function validationFromFlatten(
  fieldErrors: Record<string, readonly string[] | undefined>,
): AuthActionResult {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  return toActionResult(
    err(AppErrors.validation("Periksa kembali input Anda.", cleaned)),
  );
}

function safeRedirect(value: string | undefined): string {
  if (!value) return DEFAULT_AUTHENTICATED_ROUTE;
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }
  return value;
}

/** Email + password sign-in. Redirects on success. */
export async function signInWithPassword(
  _previous: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });
  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return toActionResult(err(mapSupabaseAuthError(error)));
  }
  redirect(safeRedirect(parsed.data.redirectTo));
}

/**
 * Resolves the public URL of an avatar uploaded to the `_signup/` folder
 * during the pre-signup flow. The path was validated by the SignUpSchema
 * (regex-locked to `_signup/{uuid}.{ext}`) so the join is safe.
 */
function avatarPublicUrlFromPendingPath(pendingPath: string): string | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${pendingPath}`;
}

/** Email + password sign-up. Sends a confirmation email when required. */
export async function signUpWithPassword(
  _previous: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const rawAvatarPendingPath = formData.get("avatarPendingPath");
  const avatarPendingPath =
    typeof rawAvatarPendingPath === "string" && rawAvatarPendingPath.length > 0
      ? rawAvatarPendingPath
      : undefined;
  const parsed = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    displayName: formData.get("displayName"),
    avatarPendingPath,
    redirectTo: formData.get("redirectTo") ?? undefined,
  });
  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }
  const supabase = await createSupabaseServerClient();
  const target = safeRedirect(parsed.data.redirectTo);
  const callback = new URL("/auth/callback", APP_URL);
  callback.searchParams.set("next", target);
  const metadata: Record<string, string> = {
    display_name: parsed.data.displayName,
  };
  if (parsed.data.avatarPendingPath) {
    const avatarUrl = avatarPublicUrlFromPendingPath(
      parsed.data.avatarPendingPath,
    );
    if (avatarUrl) metadata.avatar_url = avatarUrl;
  }
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: metadata,
      emailRedirectTo: callback.toString(),
    },
  });
  if (error) {
    return toActionResult(err(mapSupabaseAuthError(error)));
  }
  if (!data.session) {
    // Email verification required — send the user to a dedicated wait
    // page so they understand the next step (and can resend the email).
    const next = new URL(CHECK_EMAIL_ROUTE, APP_URL);
    next.searchParams.set("email", parsed.data.email);
    if (parsed.data.redirectTo) {
      next.searchParams.set("redirect", parsed.data.redirectTo);
    }
    redirect(`${next.pathname}${next.search}`);
  }
  redirect(target);
}

/**
 * Google OAuth handoff. Redirects to the provider on success, or back to
 * sign-in with `?error=google` when the handshake cannot start.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const callback = new URL("/auth/callback", APP_URL);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
    },
  });
  if (error || !data.url) {
    redirect(`${SIGN_IN_ROUTE}?error=google`);
  }
  redirect(data.url);
}

/**
 * Resend the email-verification link for a freshly created account.
 * Used by `/auth/check-email` when the user did not receive the original
 * email or let it expire. Errors are surfaced verbatim because the user
 * already entered their email on this device — there is no enumeration
 * risk beyond what sign-up itself exposes.
 */
export async function resendVerificationEmail(
  _previous: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = ResendVerificationSchema.safeParse({
    email: formData.get("email"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });
  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }
  const supabase = await createSupabaseServerClient();
  const target = safeRedirect(parsed.data.redirectTo);
  const callback = new URL("/auth/callback", APP_URL);
  callback.searchParams.set("next", target);
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: callback.toString() },
  });
  if (error) {
    return toActionResult(err(mapSupabaseAuthError(error)));
  }
  return toActionResult(ok({}));
}

/**
 * Send a password-reset email. Always resolves with a generic success
 * message so the action cannot be used as an account-enumeration oracle.
 */
export async function requestPasswordReset(
  _previous: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = RequestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }
  const supabase = await createSupabaseServerClient();
  const callback = new URL("/auth/callback", APP_URL);
  callback.searchParams.set("next", UPDATE_PASSWORD_ROUTE);
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: callback.toString() },
  );
  if (error) {
    const mapped = mapSupabaseAuthError(error);
    if (mapped.kind === "rate_limit") {
      return toActionResult(err(mapped));
    }
    // Swallow other failures to avoid leaking whether the email exists.
  }
  return toActionResult(ok({}));
}

/**
 * Set a new password for the currently-recovering session. The session is
 * established by `/auth/callback` exchanging the email recovery token.
 */
export async function updatePassword(
  _previous: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = UpdatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return toActionResult(
      err(
        AppErrors.unauthorized(
          "Sesi pemulihan tidak valid atau sudah kadaluarsa. Minta tautan baru.",
        ),
      ),
    );
  }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return toActionResult(err(mapSupabaseAuthError(error)));
  }
  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}

/**
 * Sign-out. Clears the session and returns the user to the landing page with
 * the post-sign-out notice flag so the landing can confirm the action with a
 * toast.
 */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(SIGNED_OUT_REDIRECT_ROUTE);
}
