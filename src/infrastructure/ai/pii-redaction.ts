/**
 * Build a PII-safe log context from the chat request selection. Child and region
 * identifiers are reduced to booleans so per-user identifiers never reach the
 * logs (ADR-0021). The data sent to Gemini is unaffected.
 */

import type { LogContext } from "@/domain/shared/logger";
import type { PageContextSelection } from "@/schemas/ai";

export function redactSelectionForLog(
  selection: PageContextSelection,
): LogContext {
  return {
    pageId: selection.pageId,
    hasKodeBps: selection.kodeBps !== undefined,
    hasTahun: selection.tahun !== undefined,
    hasChild: selection.childId !== undefined,
  };
}
