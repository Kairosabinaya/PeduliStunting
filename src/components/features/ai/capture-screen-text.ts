import { AI_LIMITS } from "@/config/ai";

/**
 * Capture the visible text of the current page's main content so the assistant
 * can resolve on-screen references ("rumus ini", "grafik ini"). The AI panel's
 * own subtree (`[data-ai-root]`) is excluded so we never echo the conversation
 * back as screen text. Whitespace is collapsed and the length capped to bound
 * token cost. Client-only (reads `document`); returns "" on the server.
 */
export function captureScreenText(): string {
  if (typeof document === "undefined") return "";
  const root = document.querySelector("main") ?? document.body;
  if (!(root instanceof HTMLElement)) return "";
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-ai-root]").forEach((node) => node.remove());
  const text = clone.textContent ?? "";
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, AI_LIMITS.maxScreenTextChars);
}
