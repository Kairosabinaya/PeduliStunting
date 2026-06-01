import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QUIZ_COPY } from "@/config/edukasi";

import { QuizWidget } from "./quiz-widget";

async function start(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: new RegExp(QUIZ_COPY.startCta, "i") }),
  );
  await screen.findByText(/soal 1 dari 10/i);
}

describe("QuizWidget", () => {
  it("opens on the intro panel with a start CTA", () => {
    render(<QuizWidget />);
    expect(
      screen.getByRole("button", { name: new RegExp(QUIZ_COPY.startCta, "i") }),
    ).toBeInTheDocument();
  });

  it("shows the first question with two options and gated arrows, no 'Lanjut'", async () => {
    const user = userEvent.setup();
    render(<QuizWidget />);
    await start(user);
    expect(
      screen.getByRole("button", { name: QUIZ_COPY.optionMitos }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: QUIZ_COPY.optionFakta }),
    ).toBeInTheDocument();
    // The removed "Lanjut" button must not exist anywhere.
    expect(
      screen.queryByRole("button", { name: /lanjut/i }),
    ).not.toBeInTheDocument();
    // Prev disabled on the first question; next disabled until answered.
    expect(
      screen.getByRole("button", { name: QUIZ_COPY.prevQuestionLabel }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: QUIZ_COPY.nextQuestionLabel }),
    ).toBeDisabled();
  });

  it("reveals the explanation after answering and clicking it advances", async () => {
    const user = userEvent.setup();
    render(<QuizWidget />);
    await start(user);
    await user.click(
      screen.getByRole("button", { name: QUIZ_COPY.optionMitos }),
    );
    // The explanation (tap-to-continue affordance) appears...
    const explanation = await screen.findByRole("button", {
      name: QUIZ_COPY.tapToContinueHint,
    });
    expect(explanation).toBeInTheDocument();
    // ...and the option buttons are gone.
    expect(
      screen.queryByRole("button", { name: QUIZ_COPY.optionFakta }),
    ).not.toBeInTheDocument();
    // The next arrow is now enabled too.
    expect(
      screen.getByRole("button", { name: QUIZ_COPY.nextQuestionLabel }),
    ).toBeEnabled();
    await user.click(explanation);
    expect(await screen.findByText(/soal 2 dari 10/i)).toBeInTheDocument();
  });

  it("navigates back to a prior question and keeps its answered state", async () => {
    const user = userEvent.setup();
    render(<QuizWidget />);
    await start(user);
    await user.click(
      screen.getByRole("button", { name: QUIZ_COPY.optionMitos }),
    );
    // Wait for the answered state before advancing so the swap has settled.
    await screen.findByRole("button", { name: QUIZ_COPY.tapToContinueHint });
    await user.click(
      screen.getByRole("button", { name: QUIZ_COPY.nextQuestionLabel }),
    );
    await screen.findByText(/soal 2 dari 10/i);
    await user.click(
      screen.getByRole("button", { name: QUIZ_COPY.prevQuestionLabel }),
    );
    expect(await screen.findByText(/soal 1 dari 10/i)).toBeInTheDocument();
    // Question 1 still shows its answered explanation, not the options.
    expect(
      await screen.findByRole("button", { name: QUIZ_COPY.tapToContinueHint }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: QUIZ_COPY.optionMitos }),
    ).not.toBeInTheDocument();
  });
});
