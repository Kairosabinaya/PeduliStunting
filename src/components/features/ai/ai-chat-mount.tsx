"use client";

import dynamic from "next/dynamic";

import type { RecommendedQuestionInput } from "@/application/ai/recommended-questions/build-recommended-questions";
import type { AiPageId } from "@/config/ai";
import type { PageContextSelection } from "@/schemas/ai";

// The panel (useChat + recharts + markdown) is code-split and client-only. It is
// always mounted (no launcher) per product decision, so it hydrates in after the
// page paints rather than being server-rendered.
const AiChatPanel = dynamic(
  () => import("./ai-chat-panel").then((module) => module.AiChatPanel),
  { ssr: false },
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
 * Mounts the always-on floating AI assistant. The composer pill is always
 * visible; recommendations appear when the input is focused, and messages stack
 * above as the user chats. The selection (from the page's server-side search
 * params) grounds the assistant.
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
        <AiChatPanel
          pageId={pageId}
          selection={selection}
          recommended={recommended}
        />
      </div>
    </div>
  );
}
