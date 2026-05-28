import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HighlightWord } from "./highlight-word";

describe("HighlightWord", () => {
  it("renders the children inside a span", () => {
    render(<HighlightWord>stunting</HighlightWord>);
    const span = screen.getByText("stunting");
    expect(span.tagName).toBe("SPAN");
  });

  it("applies the primary background class by default", () => {
    render(<HighlightWord>stunting</HighlightWord>);
    expect(screen.getByText("stunting").className).toMatch(/bg-primary/);
  });

  it("supports the success variant", () => {
    render(<HighlightWord variant="success">bisa berubah</HighlightWord>);
    expect(screen.getByText("bisa berubah").className).toMatch(/bg-accent/);
  });

  it("renders the rotation class by default and omits it when disabled", () => {
    const { rerender } = render(<HighlightWord>stunting</HighlightWord>);
    expect(screen.getByText("stunting").className).toMatch(/-rotate-1/);
    rerender(<HighlightWord rotate={false}>stunting</HighlightWord>);
    expect(screen.getByText("stunting").className).not.toMatch(/-rotate-1/);
  });
});
