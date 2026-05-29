/**
 * Locks the LMS implementation against published WHO Child Growth Standards
 * values so accidental refactors of `computeZScore` do not silently drift the
 * clinical interpretation. The LMS rows below are copied verbatim from the
 * WHO expanded z-score tables; the expected results match WHO Anthro v3.2.2
 * output (rounded to 4 decimal places).
 *
 * Reference: <https://www.who.int/tools/child-growth-standards/standards>.
 */

import { describe, expect, it } from "vitest";

import { computeZScore, sdValue } from "./z-score-calculator";
import { LmsParams } from "../value-objects/lms-params";

describe("computeZScore - WHO reference validation", () => {
  it("matches WHO boy 0 months weight-for-age at the median", () => {
    const params = new LmsParams({
      indicator: "BB_U",
      sex: "L",
      ageMonths: 0,
      xValue: 0,
      l: 0.3487,
      m: 3.3464,
      s: 0.14602,
    });
    expect(computeZScore(params.m, params)).toBeCloseTo(0, 6);
  });

  it("round-trips at -2 SD for WHO boy 0 months weight-for-age", () => {
    const params = new LmsParams({
      indicator: "BB_U",
      sex: "L",
      ageMonths: 0,
      xValue: 0,
      l: 0.3487,
      m: 3.3464,
      s: 0.14602,
    });
    const sdMinus2 = sdValue(params, -2);
    // WHO Anthro published -2 SD birth weight for boys is ~2.46 kg.
    expect(sdMinus2).toBeCloseTo(2.459, 2);
    expect(computeZScore(sdMinus2, params)).toBeCloseTo(-2, 4);
  });

  it("computes ~ -2.06 SD for WHO boy 24 months height-for-age at 80 cm", () => {
    const params = new LmsParams({
      indicator: "TB_U",
      sex: "L",
      ageMonths: 24,
      xValue: 0,
      l: 1,
      m: 87.1161,
      s: 0.03968,
    });
    expect(computeZScore(80, params)).toBeCloseTo(-2.0589, 3);
  });

  it("matches WHO girl 0 months weight-for-age at the median", () => {
    const params = new LmsParams({
      indicator: "BB_U",
      sex: "P",
      ageMonths: 0,
      xValue: 0,
      l: 0.3809,
      m: 3.2322,
      s: 0.14171,
    });
    expect(computeZScore(params.m, params)).toBeCloseTo(0, 6);
  });

  it("round-trips at +2 SD for boy 12 months weight-for-age", () => {
    const params = new LmsParams({
      indicator: "BB_U",
      sex: "L",
      ageMonths: 12,
      xValue: 0,
      l: -0.0738,
      m: 9.6479,
      s: 0.10487,
    });
    const plus2 = sdValue(params, 2);
    expect(computeZScore(plus2, params)).toBeCloseTo(2, 4);
  });
});
