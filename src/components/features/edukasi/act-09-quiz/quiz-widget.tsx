"use client";

// Client widget orchestrating the quiz state machine, current question UI,
// answer feedback, and result tier card. State logic lives in
// `./quiz-state.ts` so it can be unit-tested without the DOM.

import { useReducer, type Dispatch } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, ChevronRight, X } from "lucide-react";

// `AnimatePresence` is still used for the outer intro/question/result stage
// swap; the inner prompt/answered swap uses a plain keyed motion.div.

import { QUIZ_COPY } from "@/config/edukasi";
import { Button } from "@/components/primitives/button";
import { cn } from "@/lib/cn";
import {
  QUIZ_TOTAL,
  type QuizAnswer,
  type QuizQuestion,
} from "@/data/edukasi/quiz-questions";

import { QuizNavButton } from "./quiz-nav";
import { QuizProgress } from "./quiz-progress";
import { QuizResult } from "./quiz-result";
import {
  INITIAL_QUIZ_STATE,
  countCorrect,
  currentQuestion,
  quizReducer,
  type QuizAction,
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
  const transitionConfig = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.2, 0, 0, 1] as const };

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
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={transitionConfig}
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
  readonly dispatch: Dispatch<QuizAction>;
  readonly reduceMotion: boolean | null;
}

function QuestionCard({ state, dispatch, reduceMotion }: QuestionCardProps) {
  const question = currentQuestion(state);
  if (!question) return null;
  const entry = state.answers[state.index] ?? null;
  const answered = entry !== null;
  const isCorrect = entry?.correct === true;
  const currentNumber = state.index + 1;
  const isLast = state.index >= QUIZ_TOTAL - 1;
  const canPrev = state.index > 0;
  const canNext = entry !== null;
  const swapTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.2, 0, 0, 1] as const };

  return (
    // Arrows flank the card on every breakpoint (kiri/kanan), so a single set
    // is rendered — no mobile/desktop duplication. The card flexes to fill the
    // space between them.
    <div className="mx-auto flex w-full items-center justify-center gap-2 sm:gap-4">
      <QuizNavButton
        direction="prev"
        label={QUIZ_COPY.prevQuestionLabel}
        onClick={() => dispatch({ type: "prev" })}
        disabled={!canPrev}
      />

      {/* Once answered, the whole card takes on a soft green (correct) or red
          (wrong) wash. The tint is an overlay above the dark base but below the
          content, so the panel keeps its depth and the white text stays
          readable; the border picks up the matching hue. */}
      <div
        className={cn(
          "relative flex min-w-0 flex-1 flex-col gap-6 rounded-3xl border bg-edu-night/85 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl transition-colors sm:p-8",
          !answered && "border-white/15",
          answered && isCorrect && "border-accent/45",
          answered && !isCorrect && "border-edu-flag/45",
        )}
      >
        {answered ? (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 rounded-3xl",
              isCorrect ? "bg-accent/15" : "bg-edu-flag/15",
            )}
          />
        ) : null}
        <div className="relative flex items-center justify-between gap-4">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            {QUIZ_COPY.progressTemplate(currentNumber, QUIZ_TOTAL)}
          </p>
          <QuizProgress
            current={currentNumber}
            total={QUIZ_TOTAL}
            ariaLabel={QUIZ_COPY.progressTemplate(currentNumber, QUIZ_TOTAL)}
          />
        </div>

        {/* Body swaps between prompt and answered. A single keyed motion.div
            (no AnimatePresence/exit) means the outgoing block unmounts
            instantly while the incoming one plays an enter fade — keeping the
            swap deterministic (no lingering exit nodes) across prompt↔answered
            and index changes. */}
        <motion.div
          key={`${state.index}-${entry !== null ? "answered" : "prompt"}`}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={swapTransition}
          className={
            entry !== null
              ? "relative flex flex-col gap-4"
              : "relative flex flex-col gap-8"
          }
        >
          {entry !== null ? (
            <>
              {/* Statement stays visible above the explanation, now at normal
                  body size. */}
              <p className="text-base font-medium leading-relaxed text-white">
                “{question.statement}”
              </p>
              {/* The whole explanation is the advance affordance — clicking it
                  moves to the next question (or the result on the last one). */}
              <button
                type="button"
                onClick={() => dispatch({ type: "next" })}
                aria-label={
                  isLast
                    ? QUIZ_COPY.viewResultLabel
                    : QUIZ_COPY.tapToContinueHint
                }
                className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-edu-night"
              >
                <AnswerResult question={question} correct={entry.correct} />
                <span className="mt-3 flex items-center justify-end gap-1 text-xs font-medium uppercase tracking-wider text-white/60">
                  {isLast
                    ? QUIZ_COPY.viewResultLabel
                    : QUIZ_COPY.tapToContinueHint}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </>
          ) : (
            <>
              <p className="text-balance text-2xl font-semibold leading-snug text-white sm:text-3xl">
                “{question.statement}”
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {OPTIONS.map((option) => (
                  <Button
                    key={option.key}
                    variant="secondary"
                    fullWidth
                    onClick={() =>
                      dispatch({ type: "answer", choice: option.key })
                    }
                    // The button is always white, so the label needs a fixed
                    // dark colour — `text-foreground` flips to light in dark
                    // mode and vanished against the white fill.
                    className="border-2 border-white/30 bg-white text-edu-night transition-colors hover:bg-white/90"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <QuizNavButton
        direction="next"
        label={isLast ? QUIZ_COPY.viewResultLabel : QUIZ_COPY.nextQuestionLabel}
        onClick={() => dispatch({ type: "next" })}
        disabled={!canNext}
      />
    </div>
  );
}

/**
 * Result panel shown after the user answers — the verdict + explanation for
 * the current question. `aria-live="polite"` announces the outcome to
 * assistive tech as it mounts.
 */
function AnswerResult({
  question,
  correct,
}: {
  readonly question: QuizQuestion;
  readonly correct: boolean;
}) {
  const correctAnswerLabel =
    question.correctAnswer === "mitos"
      ? QUIZ_COPY.optionMitos
      : QUIZ_COPY.optionFakta;
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-white/15 bg-white/10 p-5 text-sm leading-relaxed text-white"
    >
      <div className="flex items-center gap-2">
        <span
          className={
            correct
              ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground"
              : "inline-flex h-7 w-7 items-center justify-center rounded-full bg-edu-flag text-white"
          }
        >
          {correct ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <X className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <p className="text-sm font-semibold uppercase tracking-wider">
          {correct
            ? QUIZ_COPY.feedbackCorrectLabel
            : QUIZ_COPY.feedbackWrongLabel}
        </p>
      </div>
      <p className="mt-4 text-white/90">{question.explanation}</p>
      <p className="mt-4 text-xs uppercase tracking-wider text-white/60">
        {QUIZ_COPY.correctAnswerLabel}:{" "}
        <span className="font-semibold normal-case text-white/90">
          {correctAnswerLabel}
        </span>
      </p>
      <p className="mt-1 text-xs text-white/60">
        {QUIZ_COPY.feedbackSourceLabel}: {question.sourceLabel}
      </p>
    </div>
  );
}
