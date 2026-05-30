import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LANDING_ROUTE } from "@/config/app";
import { AUTH_BRAND_PANEL, AUTH_LABELS } from "@/config/auth";

import { AuthBrandPanel } from "./auth-brand-panel";

describe("AuthBrandPanel", () => {
  it("renders the brand headline, body, and data source from config", () => {
    render(<AuthBrandPanel />);

    expect(screen.getByText(AUTH_BRAND_PANEL.headline)).toBeInTheDocument();
    expect(screen.getByText(AUTH_BRAND_PANEL.body)).toBeInTheDocument();
    expect(screen.getByText(AUTH_BRAND_PANEL.source)).toBeInTheDocument();
  });

  it("renders the three trust signals as a list", () => {
    render(<AuthBrandPanel />);

    expect(
      screen.getByText(AUTH_LABELS.trustSignals.encrypted),
    ).toBeInTheDocument();
    expect(screen.getByText(AUTH_LABELS.trustSignals.free)).toBeInTheDocument();
    expect(
      screen.getByText(AUTH_LABELS.trustSignals.official),
    ).toBeInTheDocument();
  });

  it("renders the logo with its accessible name", () => {
    render(<AuthBrandPanel />);

    expect(screen.getByAltText(AUTH_BRAND_PANEL.logo.alt)).toBeInTheDocument();
  });

  it("links back to the landing route", () => {
    render(<AuthBrandPanel />);

    const backLink = screen.getByRole("link", {
      name: AUTH_LABELS.backToHome,
    });
    expect(backLink).toHaveAttribute("href", LANDING_ROUTE);
  });
});
