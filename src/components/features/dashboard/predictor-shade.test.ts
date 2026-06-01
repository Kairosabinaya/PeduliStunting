import { describe, expect, it } from "vitest";

import { shadeFillForCorrelation } from "./predictor-shade";

describe("shadeFillForCorrelation", () => {
  it("returns the strongest risk (primary) shade for a max positive correlation", () => {
    expect(shadeFillForCorrelation(0.4, 0.4)).toBe(
      "rgb(var(--color-primary) / 1)",
    );
  });

  it("returns the strongest protective (accent) shade for a max negative correlation", () => {
    expect(shadeFillForCorrelation(-0.4, 0.4)).toBe(
      "rgb(var(--color-accent) / 1)",
    );
  });

  it("returns the neutral shade for a near-zero correlation", () => {
    expect(shadeFillForCorrelation(0.01, 0.4)).toBe(
      "rgb(var(--color-muted-foreground) / 0.5)",
    );
  });

  it("returns the neutral shade when there is no spread", () => {
    expect(shadeFillForCorrelation(0, 0)).toBe(
      "rgb(var(--color-muted-foreground) / 0.5)",
    );
  });

  it("buckets magnitude into faint shades for weak correlations", () => {
    expect(shadeFillForCorrelation(0.1, 0.4)).toBe(
      "rgb(var(--color-primary) / 0.45)",
    );
    expect(shadeFillForCorrelation(-0.3, 0.4)).toBe(
      "rgb(var(--color-accent) / 0.85)",
    );
  });
});
