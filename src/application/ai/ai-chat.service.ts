/**
 * Application orchestrator for the AI chat (Phase A). Builds the system prompt
 * from config fragments + the compact page context, sanitizes the conversation
 * to text-only parts (so a client cannot forge tool results), then asks the
 * {@link ChatModelPort} to stream. Returns `Result<ChatStreamResult, AppError>`
 * for any pre-stream failure. The streaming response itself (Phase B) escapes the
 * Result contract by design — see ADR-0020.
 */

import type { PageContextDto } from "@/application/ai/dtos";
import type {
  ChatModelPort,
  ChatStreamResult,
  ChatUiMessage,
} from "@/application/ai/ports/chat-model-port";
import type { AiToolSet } from "@/application/ai/tools/ai-tool";
import { AI_LIMITS, type AiPageId } from "@/config/ai";
import {
  AI_PAGE_CONTEXT_FENCE,
  AI_PAGE_FRAGMENTS,
  AI_SYSTEM,
} from "@/config/ai-prompts";
import { env } from "@/config/env";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import type { Logger } from "@/domain/shared/logger";
import { err, fromPromise, type Result } from "@/domain/shared/result";
import type { ChatMessageInput } from "@/schemas/ai";

export interface StartStreamInput {
  readonly pageId: AiPageId;
  readonly pageContext: PageContextDto;
  readonly messages: readonly ChatMessageInput[];
  readonly tools: AiToolSet;
  readonly abortSignal?: AbortSignal;
}

export class AiChatService {
  constructor(
    private readonly chatModel: ChatModelPort,
    private readonly logger: Logger,
  ) {}

  async startStream(
    input: StartStreamInput,
  ): Promise<Result<ChatStreamResult, AppError>> {
    const messages = sanitizeMessages(input.messages);
    if (messages.length === 0) {
      return err(AppErrors.validation("Pesan tidak boleh kosong."));
    }
    const system = buildSystemPrompt(input.pageId, input.pageContext.summary);

    return fromPromise(
      this.chatModel.stream({
        system,
        messages,
        tools: input.tools,
        maxOutputTokens: env.GEMINI_MAX_OUTPUT_TOKENS,
        maxSteps: AI_LIMITS.maxSteps,
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        onError: (error) =>
          this.logger.error("AI stream error", {
            errorClass: errorClassOf(error),
          }),
      }),
      (cause) =>
        AppErrors.externalService("Gagal memulai layanan AI.", "gemini", cause),
    );
  }
}

/** Assemble the ordered system prompt with the page fragment + fenced context. */
export function buildSystemPrompt(
  pageId: AiPageId,
  contextSummary: string,
): string {
  return [
    AI_SYSTEM.role,
    AI_SYSTEM.scope,
    AI_SYSTEM.language,
    AI_SYSTEM.grounding,
    AI_SYSTEM.medicalSafety,
    AI_SYSTEM.injectionDefense,
    AI_SYSTEM.brevity,
    AI_SYSTEM.style,
    AI_SYSTEM.screen,
    AI_PAGE_FRAGMENTS[pageId],
    `${AI_PAGE_CONTEXT_FENCE}\n${contextSummary}`,
  ].join("\n\n");
}

/**
 * Keep only non-empty text parts of user/assistant messages. System messages and
 * client-supplied tool parts are dropped so the model re-derives any data via
 * fresh tool calls (prompt-injection defense).
 */
export function sanitizeMessages(
  messages: readonly ChatMessageInput[],
): ChatUiMessage[] {
  const result: ChatUiMessage[] = [];
  for (const message of messages) {
    if (message.role === "system") continue;
    const parts = message.parts
      .filter(
        (part): part is { type: "text"; text: string } =>
          "text" in part && part.text.length > 0,
      )
      .map((part) => ({ type: "text", text: part.text }));
    if (parts.length === 0) continue;
    result.push({ role: message.role, parts });
  }
  return result;
}

function errorClassOf(error: unknown): string {
  if (error instanceof Error) return error.name;
  return "UnknownError";
}
