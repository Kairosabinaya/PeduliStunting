/**
 * Port the {@link AiChatService} depends on for streaming generation. The
 * concrete implementation (Google Generative AI via the AI SDK) lives in the
 * infrastructure layer, so the application never imports `ai`/`@ai-sdk/*`.
 *
 * This port is application-owned (not domain) because it references
 * application-level message and tool types. See ADR-0020.
 */

import type { AiToolSet } from "@/application/ai/tools/ai-tool";

/** A chat message part the assistant accepts. Only text is honoured. */
export interface ChatUiMessagePart {
  readonly type: string;
  readonly text?: string;
}

/** A sanitized chat message (text-only parts) passed to the model. */
export interface ChatUiMessage {
  readonly role: "system" | "user" | "assistant";
  readonly parts: readonly ChatUiMessagePart[];
}

export interface ChatStreamParams {
  /** Fully assembled system prompt (role, scope, grounding, safety, context). */
  readonly system: string;
  /** Conversation history, already sanitized to text-only parts. */
  readonly messages: readonly ChatUiMessage[];
  /** Page-scoped tool set the model may call. */
  readonly tools: AiToolSet;
  /** Hard output-token cap (cost guard). */
  readonly maxOutputTokens: number;
  /** Max generation/tool-call steps per turn (cost guard). */
  readonly maxSteps: number;
  /** Sampling temperature; lower = more focused, consistent answers. */
  readonly temperature: number;
  /** Reasoning-token budget for Gemini 2.5 thinking models (0 disables). */
  readonly thinkingBudgetTokens: number;
  /** Aborts the upstream call when the client stops or disconnects. */
  readonly abortSignal?: AbortSignal;
  /** Invoked on a mid-stream error for logging/observability. */
  readonly onError?: (error: unknown) => void;
}

/**
 * Opaque handle returned on a successful stream start. `toResponse()` yields the
 * HTTP `Response` carrying the UI message stream. This is the documented
 * boundary where the streaming response escapes the `Result` contract (ADR-0020).
 */
export interface ChatStreamResult {
  toResponse(): Response;
}

export interface ChatModelPort {
  /** Begin streaming. Async because UI messages are converted before sending. */
  stream(params: ChatStreamParams): Promise<ChatStreamResult>;
}
