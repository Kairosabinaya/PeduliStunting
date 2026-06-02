"use client";

/**
 * Thin wrapper over the AI SDK `useChat` hook. Wires the transport to
 * `/api/ai/chat`, attaches the current page selection to every request body, and
 * captures structured pre-stream errors (the 429 `requiresLogin` payload) from a
 * custom fetch into state so the panel can show the right error UI.
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useMemo, useState } from "react";

import type { AiChatErrorResponse } from "@/application/ai/dtos";
import { AI_CHAT_ENDPOINT } from "@/config/ai";
import type { PageContextSelection } from "@/schemas/ai";

import { captureScreenText } from "./capture-screen-text";

export interface UseAiChatResult {
  readonly messages: ReturnType<typeof useChat>["messages"];
  readonly status: ReturnType<typeof useChat>["status"];
  readonly error: Error | undefined;
  readonly structuredError: AiChatErrorResponse | null;
  readonly send: (text: string) => void;
  readonly stop: () => void;
  readonly reset: () => void;
}

export function useAiChat(selection: PageContextSelection): UseAiChatResult {
  const [structuredError, setStructuredError] =
    useState<AiChatErrorResponse | null>(null);

  // Destructure so the transport memo depends on selection values, not object
  // identity — the transport stays stable across renders and only rebuilds when
  // the actual selection changes. Undefined fields drop out of the JSON body.
  const { pageId, kodeBps, tahun, childId } = selection;
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: AI_CHAT_ENDPOINT,
        // Resolved per request so the latest on-screen text is captured.
        body: () => ({
          pageContext: {
            pageId,
            kodeBps,
            tahun,
            childId,
            screenText: captureScreenText(),
          },
        }),
        fetch: async (input, init) => {
          setStructuredError(null);
          const response = await fetch(input, init);
          if (!response.ok) {
            setStructuredError(
              (await response
                .clone()
                .json()
                .catch(() => null)) as AiChatErrorResponse | null,
            );
          }
          return response;
        },
      }),
    [pageId, kodeBps, tahun, childId],
  );

  const chat = useChat({ transport });

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      chat.sendMessage({ text: trimmed });
    },
    [chat],
  );

  const reset = useCallback(() => {
    setStructuredError(null);
    chat.clearError();
    chat.setMessages([]);
  }, [chat]);

  return {
    messages: chat.messages,
    status: chat.status,
    error: chat.error,
    structuredError,
    send,
    stop: chat.stop,
    reset,
  };
}
