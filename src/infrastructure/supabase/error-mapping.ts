import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { getLogger } from "@/infrastructure/logger/pino-logger";

/**
 * Translate a Supabase {@link PostgrestError} into the domain
 * {@link AppError} taxonomy. PostgreSQL SQLSTATE codes drive the mapping; the
 * default is `unexpected` so unknown failures surface visibly.
 *
 * Sources:
 * - 23505 unique_violation              -> conflict
 * - 23503 foreign_key_violation         -> validation
 * - 23502 not_null_violation            -> validation
 * - 23514 check_violation               -> validation
 * - 42501 insufficient_privilege (RLS)  -> forbidden
 * - PGRST116 no rows from .single()     -> not_found
 */
export function mapPostgrestError(
  error: PostgrestError,
  resource?: string,
): AppError {
  const code = error.code ?? "";
  switch (code) {
    case "23505":
      return AppErrors.conflict(error.message);
    case "23502":
    case "23503":
    case "23514":
      return AppErrors.validation(error.message);
    case "42501":
      return AppErrors.forbidden(error.message);
    case "PGRST116":
      return AppErrors.notFound(error.message, resource);
  }

  getLogger().error("Supabase Postgrest error", {
    code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    resource,
  });

  return AppErrors.externalService(
    error.message || "Supabase error",
    "supabase",
    error,
  );
}

export function mapUnknownInfrastructureError(
  cause: unknown,
  context: string,
): AppError {
  getLogger().error("Infrastructure error", {
    context,
    message: cause instanceof Error ? cause.message : String(cause),
  });
  return AppErrors.unexpected(
    cause instanceof Error ? cause.message : "Unknown error",
    cause,
  );
}
