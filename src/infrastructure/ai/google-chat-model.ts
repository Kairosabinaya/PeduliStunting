/**
 * Google Generative AI implementation of {@link ChatModelPort}. The ONLY file
 * that imports `ai` + `@ai-sdk/google`. Streams via `streamText` and exposes the
 * UI message stream Response behind the opaque {@link ChatStreamResult} handle.
 *
 * Mid-stream errors are surfaced via `onError` (logging) and masked to a friendly
 * message in the response; pre-stream failures are handled by the caller as a
 * `Result` (ADR-0020).
 */

import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import type {
  ChatModelPort,
  ChatStreamParams,
  ChatStreamResult,
  ChatUiMessage,
} from "@/application/ai/ports/chat-model-port";
import { AI_SAFETY_SETTINGS } from "@/config/ai";
import { AI_COPY } from "@/config/ai-copy";
import { env } from "@/config/env";

import { toSdkTools } from "./ai-tool-adapter";

export class GoogleChatModel implements ChatModelPort {
  private readonly provider: ReturnType<typeof createGoogleGenerativeAI>;

  constructor(apiKey: string) {
    this.provider = createGoogleGenerativeAI({ apiKey });
  }

  async stream(params: ChatStreamParams): Promise<ChatStreamResult> {
    const modelMessages = await convertToModelMessages(
      toUiMessages(params.messages),
    );

    const result = streamText({
      model: this.provider(env.GEMINI_MODEL),
      system: params.system,
      messages: modelMessages,
      // Function tools ONLY — no `google_search` grounding. Google documents the
      // built-in-grounding + function-calling combination as a Gemini 3 feature;
      // on Gemini 2.5 it made the model over-search, pull off-topic web results,
      // and burn the step budget (slow, "ga nyambung"). The model answers general
      // questions from its own knowledge and uses these tools for app numbers.
      tools: toSdkTools(params.tools),
      stopWhen: stepCountIs(params.maxSteps),
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
      providerOptions: {
        google: {
          // Small reasoning budget (gemini-2.5-flash) for coherent multi-part
          // answers; relaxed safety so health/nutrition education is not blocked.
          thinkingConfig: { thinkingBudget: params.thinkingBudgetTokens },
          safetySettings: [...AI_SAFETY_SETTINGS],
        },
      },
      ...(params.abortSignal ? { abortSignal: params.abortSignal } : {}),
      onError: ({ error }) => params.onError?.(error),
    });

    return {
      toResponse: () =>
        result.toUIMessageStreamResponse({
          onError: () => AI_COPY.errorDescription,
        }),
    };
  }
}

/** Map sanitized text-only messages into AI SDK UI messages (without ids). */
function toUiMessages(
  messages: readonly ChatUiMessage[],
): Omit<UIMessage, "id">[] {
  return messages.map((message) => ({
    role: message.role,
    parts: message.parts.map((part) => ({
      type: "text" as const,
      text: part.text ?? "",
    })),
  }));
}
