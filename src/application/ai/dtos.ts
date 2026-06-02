/**
 * DTOs that cross the AI route boundary. The selection + request schemas live in
 * `src/schemas/ai.ts` (their types come from `z.infer`); the types here have no
 * schema equivalent.
 */

import type { AiPageId } from "@/config/ai";
import type { AppError } from "@/domain/errors/app-error";

/** The compact, server-rebuilt grounding context appended to the system prompt. */
export interface PageContextDto {
  readonly pageId: AiPageId;
  /** Pre-rendered, PII-safe summary lines (never the child's name or birth date). */
  readonly summary: string;
}

/**
 * Error response shape for pre-stream (Phase A) failures. Extends the standard
 * Result error JSON with a `requiresLogin` hint so the client can show a sign-in
 * CTA when an anonymous caller is rate-limited.
 */
export interface AiChatErrorResponse {
  readonly ok: false;
  readonly error: AppError;
  readonly requiresLogin: boolean;
}
