"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { RecommendedQuestionInput } from "@/application/ai/recommended-questions/build-recommended-questions";
import type { AiPageId } from "@/config/ai";
import type { PageContextSelection } from "@/schemas/ai";

import { AiComposerShell } from "./ai-composer-shell";

// The heavy chat engine (useChat + AI SDK + recharts + katex + markdown) is
// code-split and only mounted on first interaction, so it never weighs on the
// initial route bundle / LCP. A lightweight shell stays visible meanwhile.
const AiChatPanel = dynamic(
  () => import("./ai-chat-panel").then((module) => module.AiChatPanel),
  {
    ssr: false,
    loading: () => <AiComposerShell onActivate={() => undefined} />,
  },
);

export interface AiChatMountProps {
  readonly pageId: AiPageId;
  /** Selected region (public pages). */
  readonly kodeBps?: string | undefined;
  /** Selected year (public pages). */
  readonly tahun?: number | undefined;
  /** Selected child (tracker). */
  readonly childId?: string | undefined;
}

/**
 * Mounts the always-visible AI assistant. Shows a lightweight composer shell
 * instantly; the real chat panel loads on first focus/click (and is prefetched
 * during browser idle so it is ready without blocking initial load).
 *
 * @example
 * ```tsx
 * <AiChatMount pageId="data" kodeBps="3578" tahun={2024} />
 * ```
 */
export function AiChatMount({
  pageId,
  kodeBps,
  tahun,
  childId,
}: AiChatMountProps) {
  const [activated, setActivated] = useState(false);

  // Prefetch the panel chunk during idle time (after the page is interactive)
  // so the chat is ready on first click without weighing on LCP.
  useEffect(() => {
    const prefetch = (): void => {
      void import("./ai-chat-panel");
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(prefetch, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  const selection: PageContextSelection = {
    pageId,
    ...(kodeBps ? { kodeBps } : {}),
    ...(tahun !== undefined ? { tahun } : {}),
    ...(childId ? { childId } : {}),
  };
  const recommended: RecommendedQuestionInput = {
    hasSelection: Boolean(kodeBps || childId),
    ...(tahun !== undefined ? { tahun } : {}),
  };

  return (
    <div
      data-ai-root
      className="pointer-events-none fixed inset-x-0 bottom-4 z-overlay flex justify-center px-4"
    >
      <div className="pointer-events-auto w-full max-w-2xl">
        {activated ? (
          <AiChatPanel
            pageId={pageId}
            selection={selection}
            recommended={recommended}
            autoFocusComposer
          />
        ) : (
          <AiComposerShell onActivate={() => setActivated(true)} />
        )}
      </div>
    </div>
  );
}
