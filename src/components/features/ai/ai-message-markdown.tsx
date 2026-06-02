"use client";

import "katex/dist/katex.min.css";

import { useMemo } from "react";

import { renderChatMarkdown } from "@/lib/markdown-client";

/**
 * Render an assistant text part as sanitized markdown. AI output is untrusted,
 * so {@link renderChatMarkdown} strips scripts/styles/event handlers before this
 * sets innerHTML.
 */
export function AiMessageMarkdown({ text }: { readonly text: string }) {
  const html = useMemo(() => renderChatMarkdown(text), [text]);
  return (
    <div
      className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert [&_.katex-display]:my-2"
      // Sanitized by renderChatMarkdown (DOMPurify allowlist).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
