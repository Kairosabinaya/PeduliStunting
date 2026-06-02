/**
 * Deterministic recommended-question builder. Pure and client-safe (imports only
 * config), so chips render instantly from the page's own state with NO AI call.
 */

import type { AiPageId } from "@/config/ai";
import {
  AI_RECOMMENDED_FALLBACK,
  AI_RECOMMENDED_TEMPLATES,
} from "@/config/ai-copy";

export interface RecommendedQuestionInput {
  /** True when a region (public pages) or child (tracker) is selected. */
  readonly hasSelection: boolean;
  /** Region/kabupaten display name for `{wilayah}` interpolation. */
  readonly selectionLabel?: string;
  /** Selected year for `{tahun}` interpolation. */
  readonly tahun?: number;
}

/**
 * Build the chip list for a page. Selection-only templates are dropped when no
 * selection exists; `{wilayah}`/`{tahun}` are interpolated. Falls back to a
 * generic starter set so chips always render.
 *
 * @example
 * ```ts
 * buildRecommendedQuestions("map", { hasSelection: true, selectionLabel: "Kota Surabaya", tahun: 2024 });
 * ```
 */
export function buildRecommendedQuestions(
  pageId: AiPageId,
  input: RecommendedQuestionInput,
): readonly string[] {
  const result: string[] = [];
  for (const template of AI_RECOMMENDED_TEMPLATES[pageId]) {
    if (template.requiresSelection && !input.hasSelection) continue;
    result.push(interpolate(template.text, input));
  }
  return result.length > 0 ? result : AI_RECOMMENDED_FALLBACK;
}

function interpolate(text: string, input: RecommendedQuestionInput): string {
  return text
    .replace("{wilayah}", input.selectionLabel ?? "wilayah ini")
    .replace(
      "{tahun}",
      input.tahun !== undefined ? String(input.tahun) : "terbaru",
    );
}
