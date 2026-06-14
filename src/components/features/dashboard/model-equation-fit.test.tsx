import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SIMULATOR_EQUATION } from "@/config/dashboard";

import { ModelEquationFit } from "./model-equation-fit";

// Keep the dynamic KaTeX import cheap and deterministic in tests.
vi.mock("katex", () => ({
  default: { renderToString: (tex: string) => `<span>${tex}</span>` },
}));

// 20 slopes with several zeros so the kept-zero terms (selection) are testable.
const BETA = [
  0.5, 0, -1.2, 0, 0.34, 0, 0, 0.11, 0, 0, -0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const PROPS = {
  regionName: "Bandung",
  tahun: 2024,
  alfa1: -1,
  alfa2: 1.5,
  beta: BETA,
  nActive: 5,
} as const;

// Flush the deferred KaTeX import so teardown stays inside act().
async function settle() {
  await act(async () => {});
}

describe("ModelEquationFit", () => {
  it("renders the local heading with region and year", async () => {
    render(<ModelEquationFit {...PROPS} />);
    expect(
      screen.getByText(`${SIMULATOR_EQUATION.localTitle} — Bandung, 2024`),
    ).toBeInTheDocument();
    await settle();
  });

  it("writes both cumulative-logit lines with all 20 terms incl. zeros", async () => {
    const { container } = render(<ModelEquationFit {...PROPS} />);
    const text = container.textContent ?? "";
    expect(text).toContain("logit P(Y ≤ Rendah)");
    expect(text).toContain("logit P(Y ≤ Sedang)");
    expect(text).toContain("X1");
    expect(text).toContain("X20");
    expect(text).toContain("0.00 X2"); // a kept zero-coefficient term
    await settle();
  });

  it("collapses the fitted equation by default and expands on click", async () => {
    render(<ModelEquationFit {...PROPS} />);
    const toggle = screen.getByRole("button", {
      name: new RegExp(SIMULATOR_EQUATION.localTitle, "i"),
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await settle();
  });

  it("notes proportional odds, standardization, and selection count", async () => {
    const { container } = render(<ModelEquationFit {...PROPS} />);
    expect(
      screen.getByText(SIMULATOR_EQUATION.proportionalOddsNote),
    ).toBeInTheDocument();
    expect(container.textContent ?? "").toContain("5 dari 20");
    await settle();
  });
});
