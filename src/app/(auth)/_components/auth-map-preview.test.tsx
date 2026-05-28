import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AUTH_MAP_PREVIEW_COPY } from "@/config/auth";

import { AuthMapPreview } from "./auth-map-preview";

describe("AuthMapPreview", () => {
  it("renders the title, caption, and SVG with descriptive title", () => {
    render(<AuthMapPreview />);
    expect(screen.getByText(AUTH_MAP_PREVIEW_COPY.title)).toBeInTheDocument();
    expect(screen.getByText(AUTH_MAP_PREVIEW_COPY.caption)).toBeInTheDocument();
    const figure = screen.getByRole("figure");
    expect(figure).toHaveAttribute("aria-label", AUTH_MAP_PREVIEW_COPY.alt);
  });

  it("renders the ordinal legend with three labels", () => {
    render(<AuthMapPreview />);
    expect(screen.getByText(/rendah/iu)).toBeInTheDocument();
    expect(screen.getByText(/sedang/iu)).toBeInTheDocument();
    expect(screen.getByText(/tinggi/iu)).toBeInTheDocument();
  });
});
