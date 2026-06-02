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
      tools: {
        ...toSdkTools(params.tools),
        // Web-search grounding so the model can find facts not in the app
        // instead of answering "tidak tahu" (gemini-2.5 supports combining this
        // with function tools). Provider-defined tool; key must be "google_search".
        google_search: this.provider.tools.googleSearch({}),
      },
      stopWhen: stepCountIs(params.maxSteps),
      maxOutputTokens: params.maxOutputTokens,
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
