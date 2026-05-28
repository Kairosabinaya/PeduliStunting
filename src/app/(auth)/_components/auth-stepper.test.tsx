import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AUTH_LABELS } from "@/config/auth";

import { AuthStepper } from "./auth-stepper";

describe("AuthStepper", () => {
  it("marks step 1 as current when currentStep=1", () => {
    render(<AuthStepper currentStep={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]?.getAttribute("aria-current")).toBe("step");
    expect(items[1]?.getAttribute("aria-current")).toBeNull();
  });

  it("marks step 2 as current and step 1 as complete when currentStep=2", () => {
    render(<AuthStepper currentStep={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]?.getAttribute("aria-current")).toBeNull();
    expect(items[1]?.getAttribute("aria-current")).toBe("step");
  });

  it("renders both step labels", () => {
    render(<AuthStepper currentStep={1} />);
    expect(screen.getByText(AUTH_LABELS.stepper.step1)).toBeInTheDocument();
    expect(screen.getByText(AUTH_LABELS.stepper.step2)).toBeInTheDocument();
  });
});
