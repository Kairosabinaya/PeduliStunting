import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  predictOrdinal,
  type LocalCoef,
  type PredictorMetaPoint,
  type PredictorTransform,
} from "@/domain/model/services/ordinal-predictor";

/**
 * Correctness gate aligned with the research brief's "verify first".
 *
 * `predictOrdinal` must reproduce the model's own exported truth: the
 * `pred_class_local` class and `prob_*` probabilities in `observations.csv`.
 * The committed fixture (`tests/fixtures/ordinal-prediction-cases.json`,
 * produced by `pnpm gen:prediction-fixtures`) makes this runnable in CI; when
 * the gitignored research CSVs are present locally, an additional sweep checks
 * all 2056 region-years.
 */

const PREDICTOR_COUNT = 20;
// Per-value tolerance: model_meta reports matched_oos_mean_abs_prob_diff 0.0003;
// the CSV rounds probabilities to 4 decimals, so allow a little headroom.
const PROB_TOLERANCE = 1e-3;
// Aggregate mean absolute probability difference should track the documented
// reconciliation closely.
const MEAN_PROB_TOLERANCE = 5e-4;

interface FixtureMetaPoint {
  readonly code: string;
  readonly transform: PredictorTransform;
  readonly stdMean: number;
  readonly stdSd: number;
}

interface FixtureCase {
  readonly kodeBps: string;
  readonly tahun: number;
  readonly originalValues: readonly number[];
  readonly coef: LocalCoef;
  readonly expected: {
    readonly category: "Rendah" | "Sedang" | "Tinggi";
    readonly probabilities: readonly [number, number, number];
  };
}

interface Fixture {
  readonly etaSign: number;
  readonly meta: readonly FixtureMetaPoint[];
  readonly cases: readonly FixtureCase[];
}

function toMetaPoints(
  meta: readonly FixtureMetaPoint[],
): readonly PredictorMetaPoint[] {
  return meta.map((point) => ({
    transform: point.transform,
    stdMean: point.stdMean,
    stdSd: point.stdSd,
  }));
}

function loadFixture(): Fixture {
  const path = resolve(
    process.cwd(),
    "tests",
    "fixtures",
    "ordinal-prediction-cases.json",
  );
  return JSON.parse(readFileSync(path, "utf8")) as Fixture;
}

describe("predictOrdinal", () => {
  describe("verification against observations.csv (committed fixture)", () => {
    const fixture = loadFixture();
    const meta = toMetaPoints(fixture.meta);

    it("should expose a non-empty, well-formed fixture", () => {
      expect(fixture.meta).toHaveLength(PREDICTOR_COUNT);
      expect(fixture.cases.length).toBeGreaterThan(50);
      expect(fixture.etaSign).toBe(1);
    });

    it("should reproduce pred_class_local for every fixture case", () => {
      const mismatches = fixture.cases.filter((testCase) => {
        const result = predictOrdinal(
          testCase.originalValues,
          meta,
          testCase.coef,
          fixture.etaSign,
        );
        return result.category !== testCase.expected.category;
      });
      expect(mismatches.map((m) => `${m.kodeBps}-${m.tahun}`)).toEqual([]);
    });

    it("should match stored class probabilities within the documented tolerance", () => {
      let sumAbsDiff = 0;
      let comparisons = 0;
      let withinTight = 0;
      for (const testCase of fixture.cases) {
        const { probabilities } = predictOrdinal(
          testCase.originalValues,
          meta,
          testCase.coef,
          fixture.etaSign,
        );
        const computed = [
          probabilities.rendah,
          probabilities.sedang,
          probabilities.tinggi,
        ];
        computed.forEach((value, index) => {
          const expected = testCase.expected.probabilities[index] ?? 0;
          const diff = Math.abs(value - expected);
          sumAbsDiff += diff;
          comparisons += 1;
          if (diff <= PROB_TOLERANCE) withinTight += 1;
        });
      }
      // Mean abs diff tracks model_meta.matched_oos_mean_abs_prob_diff (0.0003).
      expect(sumAbsDiff / comparisons).toBeLessThanOrEqual(MEAN_PROB_TOLERANCE);
      // The recomputation is exact for the overwhelming majority; the model's
      // exported "stored_plus" probabilities carry a few larger reconciliation
      // residuals, so assert a high share rather than every single value.
      expect(withinTight / comparisons).toBeGreaterThanOrEqual(0.97);
    });

    it("should return probabilities that sum to one", () => {
      for (const testCase of fixture.cases) {
        const { probabilities } = predictOrdinal(
          testCase.originalValues,
          meta,
          testCase.coef,
          fixture.etaSign,
        );
        const total =
          probabilities.rendah + probabilities.sedang + probabilities.tinggi;
        expect(total).toBeCloseTo(1, 10);
      }
    });
  });

  describe("behavior", () => {
    const meta: readonly PredictorMetaPoint[] = [
      { transform: "none", stdMean: 0, stdSd: 1 },
      { transform: "none", stdMean: 0, stdSd: 1 },
    ];

    it("should ignore predictors whose local slope is zero", () => {
      const withZero = predictOrdinal(
        [10, 999],
        meta,
        { alfa1: -1, alfa2: 1, beta: [0.5, 0] },
        1,
      );
      const withoutSecond = predictOrdinal(
        [10, -999],
        meta,
        { alfa1: -1, alfa2: 1, beta: [0.5, 0] },
        1,
      );
      expect(withZero.probabilities).toEqual(withoutSecond.probabilities);
    });

    it("should flip the linear predictor when etaSign is negative", () => {
      // Cumulative link: a larger eta raises P(Y<=j) = sigmoid(alfa_j + eta),
      // shifting mass toward the lowest class (Rendah). Flipping etaSign must
      // therefore reverse that direction.
      const coef: LocalCoef = { alfa1: -1, alfa2: 1, beta: [0.8, 0] };
      const positive = predictOrdinal([2, 0], meta, coef, 1);
      const negative = predictOrdinal([2, 0], meta, coef, -1);
      expect(positive.probabilities.rendah).toBeGreaterThan(
        negative.probabilities.rendah,
      );
    });

    it("should apply the log1p transform before standardizing", () => {
      const logMeta: readonly PredictorMetaPoint[] = [
        { transform: "log1p", stdMean: 0, stdSd: 1 },
      ];
      const coef: LocalCoef = { alfa1: 0, alfa2: 2, beta: [1] };
      const result = predictOrdinal([Math.expm1(3)], logMeta, coef, 1);
      // log1p(expm1(3)) === 3, standardized to 3, eta = 3.
      const expectedCum1 = 1 / (1 + Math.exp(-(0 + 3)));
      expect(result.probabilities.rendah).toBeCloseTo(expectedCum1, 6);
    });

    it("should stay total when arrays are ragged", () => {
      const result = predictOrdinal(
        [5],
        meta,
        { alfa1: 0, alfa2: 1, beta: [0.3, 0.4] },
        1,
      );
      const total =
        result.probabilities.rendah +
        result.probabilities.sedang +
        result.probabilities.tinggi;
      expect(total).toBeCloseTo(1, 10);
      expect(["Rendah", "Sedang", "Tinggi"]).toContain(result.category);
    });
  });

  describe("full sweep over observations.csv (local only)", () => {
    const csvDir = resolve(process.cwd(), "docs", "source", "dashboard_data");
    const hasSources =
      existsSync(resolve(csvDir, "observations.csv")) &&
      existsSync(resolve(csvDir, "model_coefficients.csv")) &&
      existsSync(resolve(csvDir, "predictor_meta.csv"));

    it.runIf(hasSources)(
      "should reproduce pred_class_local for all region-years",
      () => {
        const meta = loadFullMeta(csvDir);
        const coefficients = loadFullCoefficients(csvDir);
        const rows = parseCsv(
          readFileSync(resolve(csvDir, "observations.csv"), "utf8"),
        );

        let total = 0;
        let categoryMatches = 0;
        let sumAbsDiff = 0;
        let comparisons = 0;
        for (const row of rows) {
          const coef = coefficients.get(`${row.kode_bps}-${row.tahun}`);
          if (coef === undefined) continue;
          const originalValues: number[] = [];
          for (let k = 1; k <= PREDICTOR_COUNT; k += 1) {
            originalValues.push(Number(row[`x${k}`]));
          }
          const result = predictOrdinal(originalValues, meta, coef, 1);
          total += 1;
          if (result.category === (row.pred_class_local ?? "").trim()) {
            categoryMatches += 1;
          }
          const computed = [
            result.probabilities.rendah,
            result.probabilities.sedang,
            result.probabilities.tinggi,
          ];
          const stored = [
            Number(row.prob_rendah),
            Number(row.prob_sedang),
            Number(row.prob_tinggi),
          ];
          computed.forEach((value, index) => {
            sumAbsDiff += Math.abs(value - (stored[index] ?? 0));
            comparisons += 1;
          });
        }

        expect(total).toBeGreaterThan(2000);
        expect(categoryMatches).toBe(total);
        expect(sumAbsDiff / comparisons).toBeLessThanOrEqual(
          MEAN_PROB_TOLERANCE,
        );
      },
    );
  });
});

function parseCsv(text: string): readonly Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const header = lines[0];
  if (header === undefined) return [];
  const columns = header
    .split(",")
    .map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const raw = lines[i];
    if (raw === undefined) continue;
    const cells = raw.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const record: Record<string, string> = {};
    columns.forEach((col, idx) => {
      record[col] = cells[idx] ?? "";
    });
    rows.push(record);
  }
  return rows;
}

function loadFullMeta(csvDir: string): readonly PredictorMetaPoint[] {
  const rows = parseCsv(
    readFileSync(resolve(csvDir, "predictor_meta.csv"), "utf8"),
  );
  return rows
    .map((row) => {
      const transform = (row.transform ?? "none").toLowerCase();
      const safe: PredictorTransform =
        transform === "log" || transform === "log1p" ? transform : "none";
      return {
        order: Number.parseInt((row.id ?? "X0").slice(1), 10),
        point: {
          transform: safe,
          stdMean: Number(row.std_mean),
          stdSd: Number(row.std_sd),
        } satisfies PredictorMetaPoint,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.point);
}

function loadFullCoefficients(csvDir: string): ReadonlyMap<string, LocalCoef> {
  const rows = parseCsv(
    readFileSync(resolve(csvDir, "model_coefficients.csv"), "utf8"),
  );
  const map = new Map<string, LocalCoef>();
  for (const row of rows) {
    const beta: number[] = [];
    for (let k = 1; k <= PREDICTOR_COUNT; k += 1) {
      beta.push(Number(row[`beta${k}`]));
    }
    map.set(`${row.kode_bps}-${row.tahun}`, {
      alfa1: Number(row.alfa1),
      alfa2: Number(row.alfa2),
      beta,
    });
  }
  return map;
}
