/**
 * Heuristic that keeps token cost low: include the captured on-screen text in
 * the prompt ONLY when the latest user message points at something on screen
 * ("rumus ini", "grafik di atas"). Self-contained questions skip it. Pure.
 */

import { AI_SCREEN_REFERENCE_KEYWORDS } from "@/config/ai";
import type { ChatMessageInput } from "@/schemas/ai";

/** Text of the most recent user message (text parts joined). */
export function lastUserText(messages: readonly ChatMessageInput[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || message.role !== "user") continue;
    const text = message.parts
      .filter(
        (part): part is { type: "text"; text: string } =>
          "text" in part && part.text.length > 0,
      )
      .map((part) => part.text)
      .join(" ");
    if (text.length > 0) return text;
  }
  return "";
}

/** True when `text` references on-screen content. */
export function referencesScreen(text: string): boolean {
  const lower = text.toLowerCase();
  return AI_SCREEN_REFERENCE_KEYWORDS.some((keyword) =>
    lower.includes(keyword),
  );
}
