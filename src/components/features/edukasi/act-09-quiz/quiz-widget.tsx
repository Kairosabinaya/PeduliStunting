"use client";

// Client widget orchestrating the quiz state machine, current question UI,
// answer feedback, and result tier card. State logic lives in
// `./quiz-state.ts` so it can be unit-tested without the DOM.

import { useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, X } from "lucide-react";

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
  type QuizState,
} from "./quiz-state";

const OPTIONS: readonly { readonly key: QuizAnswer; readonly label: string }[] =
  [
    { key: "mitos", label: QUIZ_COPY.optionMitos },
    { key: "fakta", label: QUIZ_COPY.optionFakta },
  ] as const;

export function QuizWidget() {
  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE);
  const reduceMotion = useReducedMotion();
  // 360ms transition gives the question card a clear "rise + overlap"
  // feel against the heading while staying responsive. Reduced-motion
  // users skip the choreography entirely (duration 0).
  const transitionConfig = reduceMotion
    ? { duration: 0 }
    : { duration: 0.36, ease: [0.2, 0, 0, 1] as const };

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {state.stage === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={transitionConfig}
          >
            <IntroPanel onStart={() => dispatch({ type: "start" })} />
          </motion.div>
        ) : null}

        {state.stage === "question" ? (
          <motion.div
            key="question"
            // Rises from below (y=80) up to y=-80 — the negative end-state
            // pulls the card's top edge over the section's heading text,
            // delivering the "overlap teks utama" the user asked for.
            // Reduced-motion fallback: y=0 (no overlap, no animation).
            initial={{ opacity: 0, y: reduceMotion ? 0 : 80 }}
            animate={{ opacity: 1, y: reduceMotion ? 0 : -80 }}
            transition={transitionConfig}
            className="relative z-10"
          >
            <QuestionCard
              state={state}
              dispatch={dispatch}
              reduceMotion={reduceMotion}
            />
          </motion.div>
        ) : null}

        {state.stage === "result" ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig}
          >
            <QuizResult
              correct={countCorrect(state.answers)}
              onReset={() => dispatch({ type: "reset" })}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Intro panel — short hook copy + a deliberately prominent CTA button.
 * The CTA wears a soft primary glow (blurred clone behind it) so it reads
 * as "the thing to press" without resorting to gimmicky animation.
 */
function IntroPanel({ onStart }: { readonly onStart: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
      <p className="text-base leading-relaxed text-white/85 sm:text-lg">
        {QUIZ_COPY.intro}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="group relative inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-2xl shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-edu-night active:translate-y-0 sm:text-lg"
      >
        {/* Glow halo behind the button — clipped behind via -z-10 so it
            only paints around the pill, never over the label. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
        />
        <span>{QUIZ_COPY.startCta}</span>
        <ArrowRight
          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

interface QuestionCardProps {
  readonly state: QuizState;
  readonly dispatch: (
    action: { type: "answer"; choice: QuizAnswer } | { type: "next" },
  ) => void;
  readonly reduceMotion: boolean | null;
}

function QuestionCard({ state, dispatch, reduceMotion }: QuestionCardProps) {
  const question = currentQuestion(state);
  if (!question) return null;
  const choice = state.currentChoice;
  const answered = choice !== null;
  const currentNumber = state.index + 1;

  return (
    // Card surface: dense bluish-black with a soft inner ring + backdrop
    // blur so heading text peeks through behind the rounded edge. The
    // shadow + ring give the card depth so the overlap reads as a
    // physical pane resting over the heading, not a flat swap.
    <div className="relative mx-auto flex min-h-[38rem] max-w-2xl flex-col rounded-3xl border border-white/15 bg-edu-night/85 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
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

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.18, ease: [0.2, 0, 0, 1] }
          }
          className="flex flex-1 flex-col justify-between"
        >
          <p className="mt-8 text-balance text-2xl font-semibold leading-snug text-white sm:text-3xl">
            “{question.statement}”
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {OPTIONS.map((option) => {
              const isPicked = answered && choice.choice === option.key;
              const isCorrect = question.correctAnswer === option.key;
              const showResult = answered;
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

          <div role="status" aria-live="polite" className="mt-6 min-h-[8rem]">
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
