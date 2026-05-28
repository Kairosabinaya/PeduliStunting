/**
 * State machine for ACT 9 quiz. Lives in its own file so it can be unit
 * tested without a DOM, and so the React component is reduced to wiring
 * (project guidelines §22 file-length anti-pattern).
 *
 * Stages:
 *  - `intro`    — landing screen with the "Mulai kuis" CTA.
 *  - `question` — showing question N; either unanswered or answered.
 *  - `result`   — all questions consumed, computing the tier.
 *
 * Answers are stored as an array of correctness booleans (length =
 * question count) so we can compute the result purely from state.
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
  readonly answers: readonly QuizAnsweredEntry[];
  /** When non-null while in `question`, the question is locked and waiting for the user to click "next". */
  readonly currentChoice: QuizAnsweredEntry | null;
}

export const INITIAL_QUIZ_STATE: QuizState = {
  stage: "intro",
  index: 0,
  answers: [],
  currentChoice: null,
};

export type QuizAction =
  | { type: "start" }
  | { type: "answer"; choice: QuizAnswer }
  | { type: "next" }
  | { type: "reset" };

/**
 * Deterministic reducer for the quiz. Pure function — exported separately
 * so unit tests can drive it through entire user flows.
 */
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "start":
      return { ...INITIAL_QUIZ_STATE, stage: "question" };
    case "answer": {
      if (state.stage !== "question") return state;
      if (state.currentChoice !== null) return state;
      const question = QUIZ_QUESTIONS[state.index];
      if (!question) return state;
      const entry: QuizAnsweredEntry = {
        questionId: question.id,
        choice: action.choice,
        correct: question.correctAnswer === action.choice,
      };
      return { ...state, currentChoice: entry };
    }
    case "next": {
      if (state.stage !== "question") return state;
      if (state.currentChoice === null) return state;
      const nextAnswers = [...state.answers, state.currentChoice];
      const nextIndex = state.index + 1;
      if (nextIndex >= QUIZ_QUESTIONS.length) {
        return {
          ...state,
          stage: "result",
          index: nextIndex,
          answers: nextAnswers,
          currentChoice: null,
        };
      }
      return {
        ...state,
        index: nextIndex,
        answers: nextAnswers,
        currentChoice: null,
      };
    }
    case "reset":
      return INITIAL_QUIZ_STATE;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/** Number of correct answers among the entries already committed. */
export function countCorrect(answers: readonly QuizAnsweredEntry[]): number {
  return answers.reduce((n, entry) => (entry.correct ? n + 1 : n), 0);
}

/** Resolve the active question for stage `question`. Null otherwise. */
export function currentQuestion(state: QuizState): QuizQuestion | null {
  if (state.stage !== "question") return null;
  return QUIZ_QUESTIONS[state.index] ?? null;
}
