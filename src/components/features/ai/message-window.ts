/**
 * Pure helper for the collapsed chat view. Shows only the latest user + latest
 * assistant message; everything before collapses into a "x pesan sebelumnya"
 * pill. When `expanded`, all messages are visible.
 */

export interface MessageWindow<T> {
  readonly visible: readonly T[];
  readonly hidden: number;
}

/**
 * Compute which messages to render and how many are collapsed.
 *
 * @example
 * ```ts
 * computeVisibleMessages([u, a, u, a], false); // { visible: [u, a], hidden: 2 }
 * computeVisibleMessages([u, a], false);       // { visible: [u, a], hidden: 0 }
 * ```
 */
export function computeVisibleMessages<T extends { readonly role: string }>(
  messages: readonly T[],
  expanded: boolean,
): MessageWindow<T> {
  if (expanded || messages.length <= 2) {
    return { visible: messages, hidden: 0 };
  }
  let lastUser = -1;
  let lastAssistant = -1;
  messages.forEach((message, index) => {
    if (message.role === "user") lastUser = index;
    else if (message.role === "assistant") lastAssistant = index;
  });
  const indices = [lastUser, lastAssistant].filter((index) => index >= 0);
  const startIndex = indices.length > 0 ? Math.min(...indices) : 0;
  return { visible: messages.slice(startIndex), hidden: startIndex };
}
