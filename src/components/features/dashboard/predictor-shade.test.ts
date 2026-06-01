import { describe, expect, it } from "vitest";

import { shadeFillForCorrelation } from "./predictor-shade";

describe("shadeFillForCorrelation", () => {
  it("returns the strongest risk (primary) shade for a max positive correlation", () => {
    expect(shadeFillForCorrelation(0.4, 0.4)).toBe(
      "color-mix(in srgb, rgb(var(--color-risk)) 100%, rgb(var(--color-risk-weak)))",
    );
  });

  it("returns the strongest protective (accent) shade for a max negative correlation", () => {
    expect(shadeFillForCorrelation(-0.4, 0.4)).toBe(
      "color-mix(in srgb, rgb(var(--color-accent)) 100%, rgb(var(--color-protective-weak)))",
    );
  });

  it("returns the neutral shade when correlation is exactly 0", () => {
    expect(shadeFillForCorrelation(0, 0.4)).toBe(
      "rgb(var(--color-muted-foreground) / 0.5)",
    );
  });

  it("returns the neutral shade when there is no spread", () => {
    expect(shadeFillForCorrelation(0, 0)).toBe(
      "rgb(var(--color-muted-foreground) / 0.5)",
    );
  });

  it("interpolates colors based on correlation magnitude", () => {
    expect(shadeFillForCorrelation(0.1, 0.4)).toBe(
      "color-mix(in srgb, rgb(var(--color-risk)) 25%, rgb(var(--color-risk-weak)))",
    );
    expect(shadeFillForCorrelation(-0.3, 0.4)).toBe(
      "color-mix(in srgb, rgb(var(--color-accent)) 75%, rgb(var(--color-protective-weak)))",
    );
  });
});
