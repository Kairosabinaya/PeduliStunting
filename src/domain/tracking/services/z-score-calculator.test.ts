import { describe, expect, it } from "vitest";

import { ZScoreCalculator, computeZScore, sdValue } from "./z-score-calculator";
import { LmsParams } from "../value-objects/lms-params";

const lmsBoy24mWfa = new LmsParams({
  indicator: "BB_U",
  sex: "L",
  ageMonths: 24,
  xValue: 0,
  l: -0.1733,
  m: 12.1515,
  s: 0.10822,
});
const lmsBoy0mWfa = new LmsParams({
  indicator: "BB_U",
  sex: "L",
  ageMonths: 0,
  xValue: 0,
  l: 0.3487,
  m: 3.3464,
  s: 0.14602,
});
const lmsBoy24mHfa = new LmsParams({
  indicator: "TB_U",
  sex: "L",
  ageMonths: 24,
  xValue: 0,
  l: 1,
  m: 87.1161,
  s: 0.03968,
});

describe("computeZScore", () => {
  describe("WHO Box-Cox formula", () => {
    it("returns 0 when measurement equals M (median)", () => {
      const z = computeZScore(lmsBoy24mWfa.m, lmsBoy24mWfa);
      expect(z).toBeCloseTo(0, 6);
    });

    it("computes a finite z-score inside the ±3 SD core (L != 0)", () => {
      const z = computeZScore(13.5, lmsBoy24mWfa);
      expect(Number.isFinite(z)).toBe(true);
      expect(z).toBeGreaterThan(0);
      expect(z).toBeLessThan(3);
    });

    it("computes a negative z-score when measurement is below M", () => {
      const z = computeZScore(10.0, lmsBoy24mWfa);
      expect(z).toBeLessThan(0);
    });

    it("uses the log branch when L == 0", () => {
      const params = new LmsParams({
        indicator: "BB_U",
        sex: "L",
        ageMonths: 0,
        xValue: 0,
        l: 0,
        m: 10,
        s: 0.1,
      });
      const z = computeZScore(10, params);
      expect(z).toBeCloseTo(0, 9);
      const zAbove = computeZScore(10 * Math.exp(0.1), params);
      expect(zAbove).toBeCloseTo(1, 9);
    });
  });

  describe("tail correction beyond ±3 SD", () => {
    it("applies modified z-score for extreme positive values", () => {
      const sd3pos = sdValue(lmsBoy24mWfa, 3);
      const sd2pos = sdValue(lmsBoy24mWfa, 2);
      const extreme = sd3pos + (sd3pos - sd2pos) * 2;
      const z = computeZScore(extreme, lmsBoy24mWfa);
      expect(z).toBeCloseTo(5, 4);
    });

    it("applies modified z-score for extreme negative values", () => {
      const sd3neg = sdValue(lmsBoy24mWfa, -3);
      const sd2neg = sdValue(lmsBoy24mWfa, -2);
      const extreme = sd3neg - (sd2neg - sd3neg) * 2;
      const z = computeZScore(extreme, lmsBoy24mWfa);
      expect(z).toBeCloseTo(-5, 4);
    });

    it("preserves continuity at the +3 SD boundary", () => {
      const sd3 = sdValue(lmsBoy24mWfa, 3);
      const z = computeZScore(sd3, lmsBoy24mWfa);
      expect(z).toBeCloseTo(3, 4);
    });

    it("preserves continuity at the -3 SD boundary", () => {
      const sd3 = sdValue(lmsBoy24mWfa, -3);
      const z = computeZScore(sd3, lmsBoy24mWfa);
      expect(z).toBeCloseTo(-3, 4);
    });
  });

  describe("input validation", () => {
    it("throws when measurement is zero", () => {
      expect(() => computeZScore(0, lmsBoy24mWfa)).toThrow();
    });

    it("throws when measurement is negative", () => {
      expect(() => computeZScore(-1, lmsBoy24mWfa)).toThrow();
    });
  });

  describe("indicator parity", () => {
    it("computes a near-median z-score for a near-median newborn WFA value", () => {
      const z = computeZScore(3.3, lmsBoy0mWfa);
      expect(Math.abs(z)).toBeLessThan(0.2);
    });

    it("computes a reasonable z-score for 24m HFA (L = 1)", () => {
      const z = computeZScore(lmsBoy24mHfa.m, lmsBoy24mHfa);
      expect(z).toBeCloseTo(0, 9);
    });
  });
});

describe("sdValue", () => {
  it("round-trips through computeZScore for in-range values (L != 0)", () => {
    for (const target of [-2, -1, 0, 1, 2]) {
      const x = sdValue(lmsBoy24mWfa, target);
      const z = computeZScore(x, lmsBoy24mWfa);
      expect(z).toBeCloseTo(target, 6);
    }
  });

  it("round-trips through computeZScore for in-range values (L == 0)", () => {
    const params = new LmsParams({
      indicator: "BB_U",
      sex: "L",
      ageMonths: 0,
      xValue: 0,
      l: 0,
      m: 10,
      s: 0.1,
    });
    for (const target of [-2, -1, 0, 1, 2]) {
      const x = sdValue(params, target);
      const z = computeZScore(x, params);
      expect(z).toBeCloseTo(target, 9);
    }
  });
});

describe("ZScoreCalculator", () => {
  it("delegates to computeZScore", () => {
    const calc = new ZScoreCalculator();
    const z = calc.compute(lmsBoy24mWfa.m, lmsBoy24mWfa);
    expect(z).toBeCloseTo(0, 6);
  });
});
