import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input primitive", () => {
  it("renders a plain input by default without the icon slot", () => {
    render(<Input id="email" aria-label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.className).not.toMatch(/pl-10/u);
  });

  it("renders the leftIcon and applies left padding", () => {
    render(
      <Input
        id="email"
        aria-label="Email"
        leftIcon={<svg data-testid="email-icon" aria-hidden />}
      />,
    );
    expect(screen.getByTestId("email-icon")).toBeInTheDocument();
    const input = screen.getByLabelText("Email");
    expect(input.className).toMatch(/pl-10/u);
  });

  it("marks aria-invalid + describes the error when errorMessage is set", () => {
    render(
      <Input id="email" aria-label="Email" errorMessage="Email tidak valid" />,
    );
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.getByText("Email tidak valid")).toBeInTheDocument();
  });

  it("renders the hint when no error is present", () => {
    render(
      <Input id="email" aria-label="Email" hint="Akan dipakai untuk login." />,
    );
    expect(screen.getByText(/akan dipakai untuk login/iu)).toBeInTheDocument();
    expect(
      screen.getByLabelText("Email").getAttribute("aria-describedby"),
    ).toBe("email-hint");
  });
});
