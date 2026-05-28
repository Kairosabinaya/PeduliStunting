import { describe, expect, it } from "vitest";

import { QUIZ_QUESTIONS } from "@/data/edukasi/quiz-questions";

import {
  INITIAL_QUIZ_STATE,
  countCorrect,
  currentQuestion,
  quizReducer,
} from "./quiz-state";

describe("quizReducer", () => {
  describe("start action", () => {
    it("transitions from intro to question stage at index 0", () => {
      const next = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      expect(next.stage).toBe("question");
      expect(next.index).toBe(0);
      expect(next.answers).toHaveLength(0);
      expect(next.currentChoice).toBeNull();
    });
  });

  describe("answer action", () => {
    it("captures the user's choice without advancing the index", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const expectedCorrectness = QUIZ_QUESTIONS[0]?.correctAnswer === "mitos";
      const answered = quizReducer(started, {
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
      const answered = quizReducer(
        quizReducer(INITIAL_QUIZ_STATE, { type: "start" }),
        { type: "answer", choice: "mitos" },
      );
      const reAnswered = quizReducer(answered, {
        type: "answer",
        choice: "fakta",
      });
      expect(reAnswered).toBe(answered);
    });
  });

  describe("next action", () => {
    it("advances to the next question and accumulates the committed answer", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const answered = quizReducer(started, {
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
      let state = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      for (let i = 0; i < QUIZ_QUESTIONS.length; i += 1) {
        state = quizReducer(state, { type: "answer", choice: "fakta" });
        state = quizReducer(state, { type: "next" });
      }
      expect(state.stage).toBe("result");
      expect(state.answers).toHaveLength(QUIZ_QUESTIONS.length);
    });

    it("is a no-op if next is dispatched before an answer", () => {
      const started = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const pretended = quizReducer(started, { type: "next" });
      expect(pretended).toBe(started);
    });
  });

  describe("reset action", () => {
    it("brings any stage back to the initial state", () => {
      const state = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
      const reset = quizReducer(state, { type: "reset" });
      expect(reset).toEqual(INITIAL_QUIZ_STATE);
    });
  });
});

describe("currentQuestion", () => {
  it("returns the question at the active index during the question stage", () => {
    const state = quizReducer(INITIAL_QUIZ_STATE, { type: "start" });
    expect(currentQuestion(state)?.id).toBe(QUIZ_QUESTIONS[0]?.id);
  });

  it("returns null outside the question stage", () => {
    expect(currentQuestion(INITIAL_QUIZ_STATE)).toBeNull();
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
