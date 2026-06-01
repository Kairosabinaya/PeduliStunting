import { describe, expect, it } from "vitest";

import { QUIZ_QUESTIONS } from "@/data/edukasi/quiz-questions";

import {
  INITIAL_QUIZ_STATE,
  countCorrect,
  currentQuestion,
  quizReducer,
  type QuizState,
} from "./quiz-state";

describe("quizReducer", () => {
  describe("initial state", () => {
    it("starts on intro with one empty answer slot per question", () => {
      expect(INITIAL_QUIZ_STATE.stage).toBe("intro");
      expect(INITIAL_QUIZ_STATE.index).toBe(0);
      expect(INITIAL_QUIZ_STATE.answers).toHaveLength(QUIZ_QUESTIONS.length);
      expect(INITIAL_QUIZ_STATE.answers.every((entry) => entry === null)).toBe(
        true,
      );
    });
  });

  describe("start action", () => {
    it("transitions from intro to question at index 0", () => {
      const next = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      expect(next.stage).toBe("question");
      expect(next.index).toBe(0);
    });

    it("is a no-op when dispatched from a non-intro stage", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const reStarted = quizReducer(started, { type: "start" });
      expect(reStarted).toBe(started);
    });
  });

  describe("answer action", () => {
    it("fills the current slot without advancing the index", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const expectedCorrectness = QUIZ_QUESTIONS[0]?.correctAnswer === "mitos";
      const answered = quizReducer(started, {
        type: "answer",
        choice: "mitos",
      });
      expect(answered.index).toBe(0);
      expect(answered.answers[0]).toEqual({
        questionId: QUIZ_QUESTIONS[0]?.id,
        choice: "mitos",
        correct: expectedCorrectness,
      });
    });

    it("locks the slot — a second answer for the same question is ignored", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const answered = quizReducer(started, {
        type: "answer",
        choice: "mitos",
      });
      const reAnswered = quizReducer(answered, {
        type: "answer",
        choice: "fakta",
      });
      expect(reAnswered).toBe(answered);
    });
  });

  describe("next action", () => {
    it("advances to the next question, keeping prior answers", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const answered = quizReducer(started, {
        type: "answer",
        choice: "mitos",
      });
      const advanced = quizReducer(answered, { type: "next" });
      expect(advanced.stage).toBe("question");
      expect(advanced.index).toBe(1);
      expect(advanced.answers[0]).not.toBeNull();
    });

    it("transitions to the result stage after the last question", () => {
      let state: QuizState = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      for (let i = 0; i < QUIZ_QUESTIONS.length; i += 1) {
        state = quizReducer(state, { type: "answer", choice: "fakta" });
        state = quizReducer(state, { type: "next" });
      }
      expect(state.stage).toBe("result");
      expect(state.answers.every((entry) => entry !== null)).toBe(true);
    });

    it("is a no-op if next is dispatched before answering", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const pretended = quizReducer(started, { type: "next" });
      expect(pretended).toBe(started);
    });
  });

  describe("prev action", () => {
    it("steps back one question and retains the earlier answer", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const answered = quizReducer(started, {
        type: "answer",
        choice: "mitos",
      });
      const advanced = quizReducer(answered, { type: "next" });
      const back = quizReducer(advanced, { type: "prev" });
      expect(back.index).toBe(0);
      expect(back.answers[0]).not.toBeNull();
    });

    it("is a no-op at the first question", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const back = quizReducer(started, { type: "prev" });
      expect(back).toBe(started);
    });
  });

  describe("reset action", () => {
    it("brings any stage back to the initial intro state", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const answered = quizReducer(started, {
        type: "answer",
        choice: "mitos",
      });
      const reset = quizReducer(answered, { type: "reset" });
      expect(reset).toEqual(INITIAL_QUIZ_STATE);
    });
  });
});

describe("currentQuestion", () => {
  it("returns the question at the active index in the question stage", () => {
    const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
    expect(currentQuestion(started)?.id).toBe(QUIZ_QUESTIONS[0]?.id);
  });

  it("returns null outside the question stage", () => {
    expect(currentQuestion(INITIAL_QUIZ_STATE)).toBeNull();
    const result = { ...INITIAL_QUIZ_STATE, stage: "result" as const };
    expect(currentQuestion(result)).toBeNull();
  });
});

describe("countCorrect", () => {
  it("sums entries flagged correct and ignores empty slots", () => {
    const entries = [
      { questionId: 1, choice: "fakta" as const, correct: true },
      null,
      { questionId: 3, choice: "fakta" as const, correct: true },
      { questionId: 4, choice: "mitos" as const, correct: false },
    ];
    expect(countCorrect(entries)).toBe(2);
  });

  it("returns 0 for empty arrays", () => {
    expect(countCorrect([])).toBe(0);
  });
});
