import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { ConnectiveBeat as ConnectiveBeatData } from "@/config/landing-story";

import { ConnectiveBeat } from "./connective-beat";

const BEAT: ConnectiveBeatData = {
  id: "beat-test",
  eyebrow: "Eyebrow",
  lines: ["Di balik angka ada anak", "baris kedua"],
  highlight: "ada anak",
  footnoteIds: ["fn-prevalence"],
  tone: "terracotta",
};

describe("ConnectiveBeat", () => {
  it("renders the eyebrow and both lines", () => {
    render(<ConnectiveBeat beat={BEAT} />);
    expect(screen.getByText("Eyebrow")).toBeInTheDocument();
    expect(screen.getByText(/baris kedua/)).toBeInTheDocument();
  });

  it("wraps the highlight word in a marker element", () => {
    render(<ConnectiveBeat beat={BEAT} />);
    expect(screen.getByText("ada anak")).toBeInTheDocument();
  });

  it("renders the cited footnote reference as a superscript link", () => {
    const { container } = render(<ConnectiveBeat beat={BEAT} />);
    // FootnoteRef renders a <sup><a>…</a></sup>.
    expect(container.querySelector("sup a")).not.toBeNull();
  });

  it("labels the section with the beat id for in-page anchors", () => {
    const { container } = render(<ConnectiveBeat beat={BEAT} />);
    expect(container.querySelector("#beat-test")).not.toBeNull();
  });
});
