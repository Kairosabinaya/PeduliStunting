"use client";

// Client component because the share button accesses navigator.share.

import { useState } from "react";

import { QUIZ_COPY } from "@/config/edukasi";
import { Button } from "@/components/primitives/button";
import { resolveQuizTier, type QuizTier } from "@/data/edukasi/quiz-tiers";
import { QUIZ_TOTAL } from "@/data/edukasi/quiz-questions";

export interface QuizResultProps {
  readonly correct: number;
  readonly onReset: () => void;
}

const TONE_TO_CLASS: Record<QuizTier["tone"], string> = {
  primary: "bg-primary-soft/20 text-primary-foreground border-primary-soft/40",
  success: "bg-accent/20 text-accent-foreground border-accent/40",
  warm: "bg-edu-warm/25 text-foreground border-edu-warm/50",
};

export function QuizResult({ correct, onReset }: QuizResultProps) {
  const [shareState, setShareState] = useState<
    "idle" | "copied" | "unsupported"
  >("idle");
  const tier = resolveQuizTier(correct);
  if (tier === null) return null;

  const handleShare = async () => {
    const text = `Saya dapat ${correct} dari ${QUIZ_TOTAL} di kuis pencegahan stunting Peduli Stunting — ${tier.title}.`;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/edukasi#act-9`
        : "/edukasi#act-9";
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title: tier.title, text, url });
        return;
      } catch {
        // Fall through to clipboard fallback.
      }
    }
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard?.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareState("copied");
        return;
      } catch {
        setShareState("unsupported");
        return;
      }
    }
    setShareState("unsupported");
  };

  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow text-white/70">{QUIZ_COPY.resultEyebrow}</p>
      <div
        className={`mt-6 inline-flex items-center gap-3 rounded-full border px-5 py-2 text-sm font-semibold ${TONE_TO_CLASS[tier.tone]}`}
      >
        <span aria-hidden="true" className="text-base font-bold">
          {tier.title}
        </span>
      </div>
      <p
        className="mt-6 text-balance text-5xl font-bold tabular-nums text-white sm:text-6xl"
        aria-live="polite"
      >
        {QUIZ_COPY.resultScoreTemplate(correct, QUIZ_TOTAL)}
      </p>
      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80">
        {tier.description}
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onReset}>
          {QUIZ_COPY.retryCta}
        </Button>
        <Button variant="primary" onClick={handleShare}>
          {QUIZ_COPY.shareCta}
        </Button>
      </div>
      {shareState === "copied" ? (
        <p className="mt-4 text-xs text-white/70" role="status">
          {QUIZ_COPY.shareCopiedNote}
        </p>
      ) : null}
      {shareState === "unsupported" ? (
        <p className="mt-4 text-xs text-white/70" role="status">
          {QUIZ_COPY.shareUnsupportedNote}
        </p>
      ) : null}
    </div>
  );
}
