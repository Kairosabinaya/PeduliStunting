/**
 * State machine for ACT 9 quiz. Lives in its own file so it can be unit
 * tested without a DOM, and so the React component is reduced to wiring,
 * keeping each file within the file-length limit.
 *
 * Stages:
 *  - `intro`    — landing screen with the prominent "Mulai Kuis" CTA.
 *  - `question` — showing question N; either unanswered or answered.
 *  - `result`   — all questions consumed, computing the tier.
 *
 * Answers are kept in a fixed-length array (one slot per question, `null`
 * until answered) so the reader can move freely backward/forward and each
 * question keeps the answer it was given. Once a slot is filled it locks —
 * re-answering the same question is a no-op.
 */

import {
  QUIZ_QUESTIONS,
  type QuizAnswer,
  type QuizQuestion,
} from "@/data/edukasi/quiz-questions";

export type QuizStage = "intro" | "question" | "result";

export interface QuizAnsweredEntry {
  readonly questionId: number;
  readonly choice: QuizAnswer;
  readonly correct: boolean;
}

export interface QuizState {
  readonly stage: QuizStage;
  /** Current question index. Only meaningful in stage `question`. */
  readonly index: number;
  /**
   * One slot per question, `null` until answered. Fixed length so backward
   * navigation retains earlier answers and the result is computed purely from
   * state.
   */
  readonly answers: readonly (QuizAnsweredEntry | null)[];
}

export const INITIAL_QUIZ_STATE: QuizState = {
  stage: "intro",
  index: 0,
  answers: QUIZ_QUESTIONS.map(() => null),
};

export type QuizAction =
  | { type: "start" }
  | { type: "answer"; choice: QuizAnswer }
  | { type: "next" }
  | { type: "prev" }
  | { type: "reset" };

/**
 * Deterministic reducer for the quiz. Pure function — exported separately
 * so unit tests can drive it through entire user flows.
 */
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "start":
      // `start` is only meaningful from intro. From other stages it is a
      // no-op so the reducer remains idempotent under accidental dispatch.
      if (state.stage !== "intro") return state;
      return { ...state, stage: "question", index: 0 };
    case "answer": {
      if (state.stage !== "question") return state;
      // Locked once answered — the slot does not change on re-answer.
      if (state.answers[state.index] != null) return state;
      const question = QUIZ_QUESTIONS[state.index];
      if (!question) return state;
      const entry: QuizAnsweredEntry = {
        questionId: question.id,
        choice: action.choice,
        correct: question.correctAnswer === action.choice,
      };
      const answers = state.answers.map((existing, i) =>
        i === state.index ? entry : existing,
      );
      return { ...state, answers };
    }
    case "next": {
      if (state.stage !== "question") return state;
      // Must answer the current question before advancing.
      if (state.answers[state.index] == null) return state;
      if (state.index >= QUIZ_QUESTIONS.length - 1) {
        return { ...state, stage: "result" };
      }
      return { ...state, index: state.index + 1 };
    }
    case "prev": {
      if (state.stage !== "question") return state;
      if (state.index <= 0) return state;
      return { ...state, index: state.index - 1 };
    }
    case "reset":
      return INITIAL_QUIZ_STATE;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/** Number of correct answers among the slots already filled. */
export function countCorrect(
  answers: readonly (QuizAnsweredEntry | null)[],
): number {
  return answers.reduce((n, entry) => (entry?.correct ? n + 1 : n), 0);
}

/** Resolve the active question for stage `question`. Null otherwise. */
export function currentQuestion(state: QuizState): QuizQuestion | null {
  if (state.stage !== "question") return null;
  return QUIZ_QUESTIONS[state.index] ?? null;
}
