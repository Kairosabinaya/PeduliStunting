import { isAuthError } from "@supabase/supabase-js";

import { AppErrors, type AppError } from "@/domain/errors/app-error";

/**
 * Friendly Bahasa Indonesia messages keyed by Supabase Auth error codes.
 * The full code list lives in @supabase/auth-js (ErrorCode union). We translate
 * the codes that surface in the email/password + Google + reset/update flows;
 * anything else falls through to a generic message keyed by HTTP status.
 *
 * Keep messages user-facing: tell the user what happened in plain language and
 * what they can do next. Internal details (raw codes, request IDs) stay on the
 * server logs.
 */
const FRIENDLY_BY_CODE: Readonly<Record<string, string>> = {
  invalid_credentials: "Email atau kata sandi salah. Silakan coba lagi.",
  invalid_grant: "Email atau kata sandi salah. Silakan coba lagi.",
  email_not_confirmed:
    "Email belum terverifikasi. Periksa kotak masuk Anda untuk tautan verifikasi.",
  user_already_exists:
    "Email ini sudah terdaftar. Silakan masuk atau gunakan tautan reset kata sandi.",
  email_exists:
    "Email ini sudah terdaftar. Silakan masuk atau gunakan tautan reset kata sandi.",
  signup_disabled: "Pendaftaran sedang dinonaktifkan. Silakan coba lagi nanti.",
  weak_password:
    "Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan campuran huruf dan angka.",
  same_password: "Kata sandi baru harus berbeda dari kata sandi sebelumnya.",
  over_email_send_rate_limit:
    "Terlalu banyak permintaan email dalam waktu singkat. Tunggu sebentar lalu coba lagi.",
  over_request_rate_limit:
    "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
  otp_expired: "Tautan sudah kadaluarsa. Silakan minta tautan baru.",
  otp_disabled: "Metode masuk ini sedang dinonaktifkan.",
  user_not_found: "Akun tidak ditemukan untuk email tersebut.",
  user_banned: "Akun ini sedang dibatasi. Hubungi tim dukungan.",
  session_expired: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  reauthentication_needed:
    "Silakan masuk kembali untuk melanjutkan perubahan ini.",
  validation_failed: "Periksa kembali input Anda.",
};

const KIND_BY_CODE: Readonly<Record<string, AppError["kind"]>> = {
  invalid_credentials: "unauthorized",
  invalid_grant: "unauthorized",
  email_not_confirmed: "unauthorized",
  user_already_exists: "conflict",
  email_exists: "conflict",
  signup_disabled: "forbidden",
  weak_password: "validation",
  same_password: "validation",
  over_email_send_rate_limit: "rate_limit",
  over_request_rate_limit: "rate_limit",
  otp_expired: "unauthorized",
  otp_disabled: "forbidden",
  user_not_found: "not_found",
  user_banned: "forbidden",
  session_expired: "unauthorized",
  reauthentication_needed: "unauthorized",
  validation_failed: "validation",
};

const FALLBACK_BY_STATUS: Readonly<Record<number, AppError["kind"]>> = {
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "validation",
  429: "rate_limit",
};

const GENERIC_MESSAGE_BY_KIND: Readonly<Record<AppError["kind"], string>> = {
  validation: "Periksa kembali input Anda.",
  unauthorized: "Email atau kata sandi salah. Silakan coba lagi.",
  forbidden: "Tindakan ini tidak diizinkan untuk akun Anda.",
  not_found: "Data yang dicari tidak ditemukan.",
  conflict: "Permintaan bertabrakan dengan data yang sudah ada.",
  rate_limit:
    "Terlalu banyak percobaan dalam waktu singkat. Tunggu sebentar lalu coba lagi.",
  external_service: "Layanan masuk sedang bermasalah. Silakan coba lagi.",
  unexpected: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
};

interface AuthErrorShape {
  code: string | undefined;
  status: number | undefined;
}

function readAuthErrorShape(error: unknown): AuthErrorShape {
  if (isAuthError(error)) {
    return {
      code: typeof error.code === "string" ? error.code : undefined,
      status: typeof error.status === "number" ? error.status : undefined,
    };
  }
  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    const rawCode = candidate["code"];
    const rawStatus = candidate["status"];
    return {
      code: typeof rawCode === "string" ? rawCode : undefined,
      status: typeof rawStatus === "number" ? rawStatus : undefined,
    };
  }
  return { code: undefined, status: undefined };
}

/**
 * Translate a Supabase Auth error into our domain error taxonomy with a
 * Bahasa Indonesia user-facing message. Unknown codes fall back to the HTTP
 * status mapping; everything unrecognised becomes `unauthorized` so we never
 * leak raw SDK strings to the UI.
 *
 * @example
 * const { error } = await supabase.auth.signInWithPassword(input);
 * if (error) return err(mapSupabaseAuthError(error));
 */
export function mapSupabaseAuthError(error: unknown): AppError {
  const { code, status } = readAuthErrorShape(error);

  if (code !== undefined) {
    const codedKind = KIND_BY_CODE[code];
    if (codedKind !== undefined) {
      const message =
        FRIENDLY_BY_CODE[code] ?? GENERIC_MESSAGE_BY_KIND[codedKind];
      return buildAppError(codedKind, message, error);
    }
  }

  if (status !== undefined) {
    const statusKind = FALLBACK_BY_STATUS[status] ?? "unauthorized";
    return buildAppError(
      statusKind,
      GENERIC_MESSAGE_BY_KIND[statusKind],
      error,
    );
  }

  return AppErrors.unauthorized(GENERIC_MESSAGE_BY_KIND.unauthorized);
}

function buildAppError(
  kind: AppError["kind"],
  message: string,
  cause: unknown,
): AppError {
  switch (kind) {
    case "validation":
      return AppErrors.validation(message);
    case "unauthorized":
      return AppErrors.unauthorized(message);
    case "forbidden":
      return AppErrors.forbidden(message);
    case "not_found":
      return AppErrors.notFound(message);
    case "conflict":
      return AppErrors.conflict(message);
    case "rate_limit":
      return AppErrors.rateLimit(message);
    case "external_service":
      return AppErrors.externalService(message, "supabase-auth", cause);
    case "unexpected":
      return AppErrors.unexpected(message, cause);
  }
}
