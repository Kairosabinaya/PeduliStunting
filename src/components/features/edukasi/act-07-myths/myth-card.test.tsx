import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MythCard } from "./myth-card";

const SAMPLE = {
  id: "myth-test",
  mythText: "Stunting hanya soal kurang makan.",
  factText:
    "Stunting punya banyak penyebab — pola asuh, sanitasi, dan kondisi sosial-ekonomi.",
  sourceLabel: "Buku KIA 2024, hal. 4",
} as const;

describe("MythCard", () => {
  it("renders as a single button so keyboard users can activate it natively", () => {
    render(<MythCard card={SAMPLE} />);
    expect(
      screen.getByRole("button", { name: /lihat fakta/i }),
    ).toBeInTheDocument();
  });

  it("starts with aria-pressed=false and flips on click", async () => {
    const user = userEvent.setup();
    render(<MythCard card={SAMPLE} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles back to the myth face on a second activation", async () => {
    const user = userEvent.setup();
    render(<MythCard card={SAMPLE} />);
    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("can be activated with Enter from the keyboard", async () => {
    const user = userEvent.setup();
    render(<MythCard card={SAMPLE} />);
    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("exposes both the myth and fact text in the DOM at all times for screen readers", () => {
    render(<MythCard card={SAMPLE} />);
    expect(
      screen.getByText(/stunting hanya soal kurang makan/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/stunting punya banyak penyebab/i),
    ).toBeInTheDocument();
  });
});
