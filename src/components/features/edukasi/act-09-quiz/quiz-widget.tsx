"use client";

// Client widget orchestrating the quiz state machine, current question UI,
// answer feedback, and result tier card. State logic lives in
// `./quiz-state.ts` so it can be unit-tested without the DOM.

import { useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";

import { QUIZ_COPY } from "@/config/edukasi";
import { Button } from "@/components/primitives/button";
import { cn } from "@/lib/cn";
import { QUIZ_TOTAL, type QuizAnswer } from "@/data/edukasi/quiz-questions";

import { QuizProgress } from "./quiz-progress";
import { QuizResult } from "./quiz-result";
import {
  INITIAL_QUIZ_STATE,
  countCorrect,
  currentQuestion,
  quizReducer,
} from "./quiz-state";

const OPTIONS: readonly { readonly key: QuizAnswer; readonly label: string }[] =
  [
    { key: "mitos", label: QUIZ_COPY.optionMitos },
    { key: "fakta", label: QUIZ_COPY.optionFakta },
  ] as const;

export function QuizWidget() {
  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE);
  const reduceMotion = useReducedMotion();
  // Short crossfade (no `mode="wait"`) so question transitions don't show a
  // ~500ms blank state mid-swap. 180ms is fast enough to feel snappy but long
  // enough for screen readers to register the re-mount.
  const transitionConfig = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.2, 0, 0, 1] as const };

  if (state.stage === "intro") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="mx-auto max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          {QUIZ_COPY.intro}
        </p>
        <div className="mt-10">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => dispatch({ type: "start" })}
          >
            {QUIZ_COPY.startCta}
          </Button>
        </div>
      </div>
    );
  }

  if (state.stage === "result") {
    return (
      <QuizResult
        correct={countCorrect(state.answers)}
        onReset={() => dispatch({ type: "reset" })}
      />
    );
  }

  const question = currentQuestion(state);
  if (!question) return null;
  const choice = state.currentChoice;
  const answered = choice !== null;
  const currentNumber = state.index + 1;

  return (
    // Reserve a minimum height so the layout doesn't jump between
    // questions whose feedback box adds 100-200px to the widget. Inner
    // content is flex-justified so short and long questions both
    // appear at the top, never drifting down the dark band.
    <div className="mx-auto flex min-h-[34rem] max-w-2xl flex-col">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium uppercase tracking-wider text-white/70">
          {QUIZ_COPY.progressTemplate(currentNumber, QUIZ_TOTAL)}
        </p>
        <QuizProgress
          current={currentNumber}
          total={QUIZ_TOTAL}
          ariaLabel={QUIZ_COPY.progressTemplate(currentNumber, QUIZ_TOTAL)}
        />
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={transitionConfig}
        >
          <p className="mt-8 text-balance text-2xl font-semibold leading-snug text-white sm:text-3xl">
            “{question.statement}”
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {OPTIONS.map((option) => {
              const isPicked = answered && choice.choice === option.key;
              const isCorrect = question.correctAnswer === option.key;
              const showResult = answered;
              // Color states after answer:
              //   - correct answer (whether or not picked) → green ring + check
              //   - picked + wrong → red ring + cross
              //   - other untouched options → ghost
              const tone = (() => {
                if (!showResult) return "interactive";
                if (isCorrect) return "correct";
                if (isPicked) return "wrong";
                return "neutral";
              })();
              return (
                <Button
                  key={option.key}
                  variant="secondary"
                  fullWidth
                  onClick={() =>
                    dispatch({ type: "answer", choice: option.key })
                  }
                  disabled={answered}
                  aria-pressed={isPicked}
                  // The dark-band background makes transparent feedback
                  // tints unreadable, so each answered state uses a SOLID
                  // background + high-contrast text. Default (interactive)
                  // keeps the original white pill so the click target is
                  // visible against the navy.
                  className={cn(
                    "border-2 transition-colors disabled:opacity-100",
                    tone === "interactive" &&
                      "border-white/30 bg-white text-foreground hover:bg-white/90",
                    tone === "correct" &&
                      "border-accent bg-accent text-accent-foreground",
                    tone === "wrong" &&
                      "border-edu-flag bg-edu-flag text-white",
                    tone === "neutral" &&
                      "border-white/15 bg-white/5 text-white/70",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {tone === "correct" ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                    {tone === "wrong" ? (
                      <X className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                    <span>{option.label}</span>
                  </span>
                </Button>
              );
            })}
          </div>

          <div role="status" aria-live="polite" className="mt-6 min-h-[5rem]">
            {answered ? (
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-relaxed text-white">
                <p className="text-xs font-semibold uppercase tracking-wider">
                  {choice.correct
                    ? QUIZ_COPY.feedbackCorrectLabel
                    : QUIZ_COPY.feedbackWrongLabel}
                </p>
                <p className="mt-2 text-white/90">{question.explanation}</p>
                <p className="mt-3 text-xs text-white/60">
                  {QUIZ_COPY.feedbackSourceLabel}: {question.sourceLabel}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              onClick={() => dispatch({ type: "next" })}
              disabled={!answered}
            >
              {currentNumber === QUIZ_TOTAL
                ? QUIZ_COPY.finishCta
                : QUIZ_COPY.nextQuestionCta}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
