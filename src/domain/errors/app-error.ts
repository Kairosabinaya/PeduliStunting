/**
 * Error taxonomy used across every layer.
 *
 * All errors that cross a layer boundary (use case -> Server Action,
 * use case -> Route Handler) MUST be one of the union members defined here.
 * Use cases return `Result<T, AppError>` instead of throwing.
 */

export type AppErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "external_service"
  | "unexpected";

interface AppErrorBase<K extends AppErrorKind> {
  readonly kind: K;
  readonly message: string;
  readonly correlationId?: string;
  readonly cause?: unknown;
}

export interface ValidationError extends AppErrorBase<"validation"> {
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
}

export type UnauthorizedError = AppErrorBase<"unauthorized">;

export type ForbiddenError = AppErrorBase<"forbidden">;

export interface NotFoundError extends AppErrorBase<"not_found"> {
  readonly resource?: string;
}

export type ConflictError = AppErrorBase<"conflict">;

export interface RateLimitError extends AppErrorBase<"rate_limit"> {
  readonly retryAfterSeconds?: number;
}

export interface ExternalServiceError extends AppErrorBase<"external_service"> {
  readonly service?: string;
}

export type UnexpectedError = AppErrorBase<"unexpected">;

export type AppError =
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError
  | ConflictError
  | RateLimitError
  | ExternalServiceError
  | UnexpectedError;

export const AppErrors = {
  validation(
    message: string,
    fieldErrors?: Readonly<Record<string, readonly string[]>>,
  ): ValidationError {
    return fieldErrors
      ? { kind: "validation", message, fieldErrors }
      : { kind: "validation", message };
  },

  unauthorized(
    message = "Anda perlu masuk untuk melanjutkan.",
  ): UnauthorizedError {
    return { kind: "unauthorized", message };
  },

  forbidden(
    message = "Anda tidak memiliki akses untuk tindakan ini.",
  ): ForbiddenError {
    return { kind: "forbidden", message };
  },

  notFound(message: string, resource?: string): NotFoundError {
    return resource
      ? { kind: "not_found", message, resource }
      : { kind: "not_found", message };
  },

  conflict(message: string): ConflictError {
    return { kind: "conflict", message };
  },

  rateLimit(message: string, retryAfterSeconds?: number): RateLimitError {
    return retryAfterSeconds !== undefined
      ? { kind: "rate_limit", message, retryAfterSeconds }
      : { kind: "rate_limit", message };
  },

  externalService(
    message: string,
    service?: string,
    cause?: unknown,
  ): ExternalServiceError {
    const base: ExternalServiceError = { kind: "external_service", message };
    return {
      ...base,
      ...(service !== undefined ? { service } : {}),
      ...(cause !== undefined ? { cause } : {}),
    };
  },

  unexpected(
    message = "Terjadi kesalahan yang tidak terduga.",
    cause?: unknown,
  ): UnexpectedError {
    return cause !== undefined
      ? { kind: "unexpected", message, cause }
      : { kind: "unexpected", message };
  },
} as const;

/**
 * Map a domain {@link AppError} to the HTTP status code Route Handlers should
 * return.
 */
export function appErrorToHttpStatus(error: AppError): number {
  switch (error.kind) {
    case "validation":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "conflict":
      return 409;
    case "rate_limit":
      return 429;
    case "external_service":
      return 502;
    case "unexpected":
      return 500;
  }
}
