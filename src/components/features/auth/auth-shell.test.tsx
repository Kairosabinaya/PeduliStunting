import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LANDING_ROUTE } from "@/config/app";
import { AUTH_LABELS } from "@/config/auth";

import { AuthShell } from "./auth-shell";

// ThemeToggle reads from the theme provider context, which is not mounted in a
// unit test; stub it so the shell renders in isolation.
vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">tema</button>,
}));

describe("AuthShell", () => {
  it("renders the children form region", () => {
    render(
      <AuthShell>
        <div data-testid="auth-page">form content</div>
      </AuthShell>,
    );

    expect(screen.getByTestId("auth-page")).toBeInTheDocument();
  });

  it("exposes a back-to-home affordance pointing at the landing route", () => {
    render(
      <AuthShell>
        <div>form content</div>
      </AuthShell>,
    );

    const backLinks = screen.getAllByRole("link", {
      name: AUTH_LABELS.backToHome,
    });
    expect(backLinks.length).toBeGreaterThan(0);
    for (const link of backLinks) {
      expect(link).toHaveAttribute("href", LANDING_ROUTE);
    }
  });

  it("renders the theme toggle island", () => {
    render(
      <AuthShell>
        <div>form content</div>
      </AuthShell>,
    );

    expect(screen.getByRole("button", { name: "tema" })).toBeInTheDocument();
  });
});
