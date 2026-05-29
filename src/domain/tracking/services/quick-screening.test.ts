import { describe, expect, it } from "vitest";

import { computeQuickScreening } from "./quick-screening";
import { LmsParams } from "../value-objects/lms-params";

const bbU0boys = new LmsParams({
  indicator: "BB_U",
  sex: "L",
  ageMonths: 0,
  xValue: 0,
  l: 0.3487,
  m: 3.3464,
  s: 0.14602,
});

const tbU0boys = new LmsParams({
  indicator: "TB_U",
  sex: "L",
  ageMonths: 0,
  xValue: 0,
  l: 1,
  m: 49.8842,
  s: 0.0379,
});

const bbTb50cmBoys = new LmsParams({
  indicator: "BB_TB",
  sex: "L",
  ageMonths: 0,
  xValue: 50,
  l: -0.3521,
  m: 3.0095,
  s: 0.09182,
});

describe("computeQuickScreening", () => {
  it("returns null stunting when no height is supplied", () => {
    const result = computeQuickScreening(
      {
        sex: "L",
        ageMonths: 0,
        weightKg: 3.3,
        heightCm: null,
      },
      { bbU: bbU0boys, tbU: tbU0boys, bbTb: bbTb50cmBoys },
    );
    expect(result.stunting).toBeNull();
    expect(result.supporting).toHaveLength(1);
    expect(result.supporting[0]?.indicator).toBe("BB_U");
  });

  it("returns TB/U as the headline when height is supplied", () => {
    const result = computeQuickScreening(
      {
        sex: "L",
        ageMonths: 0,
        weightKg: 3.3,
        heightCm: 49.88,
      },
      { bbU: bbU0boys, tbU: tbU0boys, bbTb: bbTb50cmBoys },
    );
    expect(result.stunting).not.toBeNull();
    expect(result.stunting?.indicator).toBe("TB_U");
    expect(result.stunting?.sdClass).toBe("normal");
  });

  it("classifies very low TB/U as sangat_pendek (stunting berat)", () => {
    const result = computeQuickScreening(
      {
        sex: "L",
        ageMonths: 0,
        weightKg: null,
        heightCm: 40,
      },
      { bbU: bbU0boys, tbU: tbU0boys, bbTb: bbTb50cmBoys },
    );
    expect(result.stunting?.sdClass).toBe("sangat_pendek");
  });

  it("skips BB/TB when only weight is supplied (length axis unknown)", () => {
    const result = computeQuickScreening(
      {
        sex: "L",
        ageMonths: 0,
        weightKg: 3.3,
        heightCm: null,
      },
      { bbU: bbU0boys, tbU: tbU0boys, bbTb: bbTb50cmBoys },
    );
    expect(
      result.supporting.find((o) => o.indicator === "BB_TB"),
    ).toBeUndefined();
  });

  it("ignores indicators whose LMS lookup returned null", () => {
    const result = computeQuickScreening(
      {
        sex: "L",
        ageMonths: 0,
        weightKg: 3.3,
        heightCm: 49.88,
      },
      { bbU: null, tbU: tbU0boys, bbTb: bbTb50cmBoys },
    );
    expect(
      result.supporting.find((o) => o.indicator === "BB_U"),
    ).toBeUndefined();
    expect(result.stunting?.indicator).toBe("TB_U");
  });

  it("handles non-positive measurements safely by skipping", () => {
    const result = computeQuickScreening(
      {
        sex: "L",
        ageMonths: 0,
        weightKg: 0,
        heightCm: -1,
      },
      { bbU: bbU0boys, tbU: tbU0boys, bbTb: bbTb50cmBoys },
    );
    expect(result.stunting).toBeNull();
    expect(result.supporting).toHaveLength(0);
  });
});
