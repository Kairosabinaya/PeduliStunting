import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DETERMINANT_LAYERS } from "@/data/edukasi/determinants";

import { DeterminantCard } from "./determinant-card";

describe("DeterminantCard", () => {
  it("renders the layer label, description, and evidence", () => {
    const layer = DETERMINANT_LAYERS[0];
    if (!layer) throw new Error("expected at least one layer");
    render(<DeterminantCard layer={layer} />);
    expect(
      screen.getByRole("heading", { name: layer.label }),
    ).toBeInTheDocument();
    expect(screen.getByText(layer.description)).toBeInTheDocument();
    expect(screen.getByText(layer.evidenceBody)).toBeInTheDocument();
  });

  it("marks the card as current when active", () => {
    const layer = DETERMINANT_LAYERS[0];
    if (!layer) throw new Error("expected at least one layer");
    const { rerender } = render(<DeterminantCard layer={layer} />);
    expect(
      screen.getByRole("heading", { name: layer.label }).closest("article"),
    ).not.toHaveAttribute("aria-current");
    rerender(<DeterminantCard layer={layer} active />);
    expect(
      screen.getByRole("heading", { name: layer.label }).closest("article"),
    ).toHaveAttribute("aria-current", "true");
  });
});
