import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EDUKASI_FOOTNOTES } from "@/data/edukasi/footnotes";

import { FootnoteRef } from "./footnote-ref";

describe("FootnoteRef", () => {
  it("renders the 1-based footnote number for a known id", () => {
    const first = EDUKASI_FOOTNOTES[0];
    if (!first) throw new Error("expected at least one footnote");
    render(<FootnoteRef id={first.id} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders nothing when the id is unknown so the page stays renderable", () => {
    const { container } = render(<FootnoteRef id="fn-bogus" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links to the matching #fn-<id> anchor", () => {
    const first = EDUKASI_FOOTNOTES[0];
    if (!first) throw new Error("expected at least one footnote");
    render(<FootnoteRef id={first.id} />);
    const anchor = screen.getByRole("link");
    expect(anchor).toHaveAttribute("href", `#${first.id}`);
  });

  it("exposes an accessible label that announces the footnote number", () => {
    const first = EDUKASI_FOOTNOTES[0];
    if (!first) throw new Error("expected at least one footnote");
    render(<FootnoteRef id={first.id} />);
    expect(
      screen.getByRole("link", { name: /catatan kaki 1/i }),
    ).toBeInTheDocument();
  });
});
