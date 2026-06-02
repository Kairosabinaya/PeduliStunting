"use client";

import { BarChart3, ChevronRight } from "lucide-react";

import {
  buildRecommendedQuestions,
  type RecommendedQuestionInput,
} from "@/application/ai/recommended-questions/build-recommended-questions";
import type { AiPageId } from "@/config/ai";
import { AI_COPY } from "@/config/ai-copy";

/**
 * Empty-state suggestion card (GeoPangan-style): a heading plus deterministic,
 * context-aware question rows. Clicking a row sends it. No AI call.
 */
export function AiRecommendedChips({
  pageId,
  input,
  onPick,
  disabled,
}: {
  readonly pageId: AiPageId;
  readonly input: RecommendedQuestionInput;
  readonly onPick: (question: string) => void;
  readonly disabled?: boolean;
}) {
  const questions = buildRecommendedQuestions(pageId, input);
  return (
    <div className="glass-floating rounded-2xl p-2">
      <p className="px-2 py-2 text-xs font-medium text-muted-foreground">
        {AI_COPY.recommendedHeading}
      </p>
      <ul>
        {questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(question)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <BarChart3 className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{question}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
