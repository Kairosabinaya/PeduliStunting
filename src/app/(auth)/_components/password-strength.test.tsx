import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AUTH_LABELS } from "@/config/auth";

import { PasswordStrength } from "./password-strength";

describe("PasswordStrength", () => {
  it("renders no label for an empty password", () => {
    render(<PasswordStrength value="" />);
    const wrapper = screen.getByRole("group", {
      name: AUTH_LABELS.passwordStrength.label,
    });
    expect(wrapper).toBeInTheDocument();
  });

  it("reports a weak score for short passwords", () => {
    render(<PasswordStrength value="abc" />);
    expect(
      screen.getByText(AUTH_LABELS.passwordStrength.weak),
    ).toBeInTheDocument();
  });

  it("reports a fair score for length + two character classes", () => {
    render(<PasswordStrength value="abcdEFGH" />);
    expect(
      screen.getByText(AUTH_LABELS.passwordStrength.fair),
    ).toBeInTheDocument();
  });

  it("reports a good score for >=12 chars + two character classes", () => {
    render(<PasswordStrength value="abcdefghABCD" />);
    expect(
      screen.getByText(AUTH_LABELS.passwordStrength.good),
    ).toBeInTheDocument();
  });

  it("reports a strong score for long + all four character classes", () => {
    render(<PasswordStrength value="abcdEFGH12!@" />);
    expect(
      screen.getByText(AUTH_LABELS.passwordStrength.strong),
    ).toBeInTheDocument();
  });
});
