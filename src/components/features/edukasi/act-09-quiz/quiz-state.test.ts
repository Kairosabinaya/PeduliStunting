import { describe, expect, it } from "vitest";

import { QUIZ_QUESTIONS } from "@/data/edukasi/quiz-questions";

import {
  INITIAL_QUIZ_STATE,
  countCorrect,
  currentQuestion,
  quizReducer,
} from "./quiz-state";

describe("quizReducer", () => {
  describe("initial state", () => {
    it("starts directly on the first question (no intro gate)", () => {
      expect(INITIAL_QUIZ_STATE.stage).toBe("question");
      expect(INITIAL_QUIZ_STATE.index).toBe(0);
      expect(INITIAL_QUIZ_STATE.answers).toHaveLength(0);
      expect(INITIAL_QUIZ_STATE.currentChoice).toBeNull();
    });
  });

  describe("answer action", () => {
    it("captures the user's choice without advancing the index", () => {
      const expectedCorrectness = QUIZ_QUESTIONS[0]?.correctAnswer === "mitos";
      const answered = quizReducer(INITIAL_QUIZ_STATE, {
        type: "answer",
        choice: "mitos",
      });
      expect(answered.index).toBe(0);
      expect(answered.currentChoice).toEqual({
        questionId: QUIZ_QUESTIONS[0]?.id,
        choice: "mitos",
        correct: expectedCorrectness,
      });
    });

    it("ignores subsequent answer actions for the same question", () => {
      const answered = quizReducer(INITIAL_QUIZ_STATE, {
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
    it("advances to the next question and accumulates the committed answer", () => {
      const answered = quizReducer(INITIAL_QUIZ_STATE, {
        type: "answer",
        choice: "mitos",
      });
      const advanced = quizReducer(answered, { type: "next" });
      expect(advanced.stage).toBe("question");
      expect(advanced.index).toBe(1);
      expect(advanced.answers).toHaveLength(1);
      expect(advanced.currentChoice).toBeNull();
    });

    it("transitions to the result stage after the last question", () => {
      let state = INITIAL_QUIZ_STATE;
      for (let i = 0; i < QUIZ_QUESTIONS.length; i += 1) {
        state = quizReducer(state, { type: "answer", choice: "fakta" });
        state = quizReducer(state, { type: "next" });
      }
      expect(state.stage).toBe("result");
      expect(state.answers).toHaveLength(QUIZ_QUESTIONS.length);
    });

    it("is a no-op if next is dispatched before an answer", () => {
      const pretended = quizReducer(INITIAL_QUIZ_STATE, { type: "next" });
      expect(pretended).toBe(INITIAL_QUIZ_STATE);
    });
  });

  describe("reset action", () => {
    it("brings any stage back to the initial state", () => {
      const answered = quizReducer(INITIAL_QUIZ_STATE, {
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
    expect(currentQuestion(INITIAL_QUIZ_STATE)?.id).toBe(QUIZ_QUESTIONS[0]?.id);
  });

  it("returns null outside the question stage", () => {
    const result = { ...INITIAL_QUIZ_STATE, stage: "result" as const };
    expect(currentQuestion(result)).toBeNull();
  });
});

describe("countCorrect", () => {
  it("sums entries flagged as correct", () => {
    const entries = [
      { questionId: 1, choice: "fakta" as const, correct: true },
      { questionId: 2, choice: "mitos" as const, correct: false },
      { questionId: 3, choice: "fakta" as const, correct: true },
    ];
    expect(countCorrect(entries)).toBe(2);
  });

  it("returns 0 for empty arrays", () => {
    expect(countCorrect([])).toBe(0);
  });
});
