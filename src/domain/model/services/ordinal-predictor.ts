/**
 * GTWENOLR local ordinal predictor.
 *
 * Pure, framework-free domain service: no IO, no React/Next/Supabase imports,
 * so it can be imported by both the Vitest verification test and the client
 * what-if simulator bundle. This is the single canonical home of the model's
 * prediction formula (project guidelines §3 — domain logic, zero framework deps).
 *
 * The model is *local*: every region-year carries its own intercepts
 * (`alfa1`, `alfa2`) and slope vector (`beta`). A prediction therefore answers
 * "if THIS region had these predictor values, which class would the model
 * assign", not a prediction for an arbitrary location.
 *
 * Pipeline (order is load-bearing, per the research spec):
 *   1. transform each original predictor value (`none` | `log` | `log1p`)
 *   2. standardize with the predictor's `stdMean` / `stdSd`
 *   3. multiply by the local slope `beta[k]`, sum, multiply by `etaSign`
 *   4. cumulative ordinal link: `P(Y<=j) = sigmoid(alfa_j + eta)`
 *   5. class probabilities, clamped to >= 0 and renormalized to sum 1
 *   6. predicted class = argmax of the probabilities
 *
 * The reference snippet ended with
 * `["Rendah","Sedang","Tinggi"][p.map(x => x/s).indexOf(Math.max(...p))]`.
 * Taken literally that searches the *renormalized* array for the *un*normalized
 * maximum, which only resolves when `s === 1` exactly and is otherwise unsound
 * (returns -1). The intent is plainly argmax of the class probabilities, and
 * because renormalization is monotonic the argmax is identical before and after
 * dividing by `s`. We implement argmax directly and let the verification test
 * (`ordinal-predictor.test.ts`, which reconciles against the `pred_class_local`
 * and `prob_*` columns of `observations.csv`) be the arbiter of correctness.
 *
 * @example
 * ```ts
 * const meta = [
 *   { transform: "none", stdMean: 11.66, stdSd: 7.25 },
 *   { transform: "log1p", stdMean: 0.95, stdSd: 0.46 },
 * ];
 * const coef = { alfa1: -0.74, alfa2: 2.69, beta: [-0.058, -0.018] };
 * const out = predictOrdinal([18.98, 2.37], meta, coef, 1);
 * // out.category -> "Rendah" | "Sedang" | "Tinggi"
 * // out.probabilities -> { rendah, sedang, tinggi } summing to 1
 * ```
 */

import {
  STUNTING_CATEGORIES,
  type StuntingCategory,
} from "@/domain/region/value-objects/stunting-category";

/** Standardization recipe for one predictor (from `predictor_meta`). */
export type PredictorTransform = "none" | "log" | "log1p";

/** The per-predictor parameters needed to standardize a raw value. */
export interface PredictorMetaPoint {
  readonly transform: PredictorTransform;
  readonly stdMean: number;
  readonly stdSd: number;
}

/** Local coefficient set for one region-year (GTWENOLR cumulative link). */
export interface LocalCoef {
  readonly alfa1: number;
  readonly alfa2: number;
  /** Slopes ordered to match `meta` and `originalValues` (X1..X20). */
  readonly beta: readonly number[];
}

/** Renormalized probability mass for each ordinal class (sums to 1). */
export interface OrdinalProbabilities {
  readonly rendah: number;
  readonly sedang: number;
  readonly tinggi: number;
}

/** Predicted class plus the class probabilities it was chosen from. */
export interface PredictionResult {
  readonly category: StuntingCategory;
  readonly probabilities: OrdinalProbabilities;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Transform then standardize a single raw predictor value. Returns `0`
 * (a no-op contribution) when the standard deviation is zero or the transform
 * produces a non-finite value, keeping the predictor total.
 */
function standardize(value: number, meta: PredictorMetaPoint): number {
  const transformed =
    meta.transform === "log1p"
      ? Math.log1p(value)
      : meta.transform === "log"
        ? Math.log(value)
        : value;
  if (meta.stdSd === 0 || !Number.isFinite(transformed)) return 0;
  const standardized = (transformed - meta.stdMean) / meta.stdSd;
  return Number.isFinite(standardized) ? standardized : 0;
}

/**
 * Predict the stunting class and class probabilities for one region-year from
 * raw predictor values, the standardization recipe, and local coefficients.
 *
 * Total function: tolerates ragged inputs by iterating the shared length and
 * skipping any missing or selected-out (`beta[k] === 0`) predictor — skipping a
 * zero slope also avoids `0 * Infinity = NaN` when a selected-out predictor
 * sits at the edge of a log domain.
 *
 * @param originalValues raw predictor values in original units, ordered X1..X20
 * @param meta standardization parameters, ordered to match `originalValues`
 * @param coef local intercepts + slopes for this region-year
 * @param etaSign linear-predictor sign convention (`1` for this model)
 * @returns the argmax class and its renormalized probabilities
 */
export function predictOrdinal(
  originalValues: readonly number[],
  meta: readonly PredictorMetaPoint[],
  coef: LocalCoef,
  etaSign: number,
): PredictionResult {
  const count = Math.min(originalValues.length, meta.length, coef.beta.length);
  let dot = 0;
  for (let k = 0; k < count; k += 1) {
    const slope = coef.beta[k];
    if (slope === undefined || slope === 0) continue;
    const value = originalValues[k];
    const point = meta[k];
    if (value === undefined || point === undefined) continue;
    dot += slope * standardize(value, point);
  }
  const eta = etaSign * dot;

  const cumRendah = sigmoid(coef.alfa1 + eta);
  const cumSedang = sigmoid(coef.alfa2 + eta);
  const pRendah = Math.max(cumRendah, 0);
  const pSedang = Math.max(cumSedang - cumRendah, 0);
  const pTinggi = Math.max(1 - cumSedang, 0);

  const total = pRendah + pSedang + pTinggi;
  const safeTotal = total > 0 ? total : 1;
  const probabilities: OrdinalProbabilities = {
    rendah: pRendah / safeTotal,
    sedang: pSedang / safeTotal,
    tinggi: pTinggi / safeTotal,
  };

  const ordered: readonly number[] = [
    probabilities.rendah,
    probabilities.sedang,
    probabilities.tinggi,
  ];
  let bestIndex = 0;
  let bestValue = probabilities.rendah;
  for (let i = 1; i < ordered.length; i += 1) {
    const candidate = ordered[i];
    if (candidate !== undefined && candidate > bestValue) {
      bestValue = candidate;
      bestIndex = i;
    }
  }

  return {
    category: STUNTING_CATEGORIES[bestIndex] ?? STUNTING_CATEGORIES[0],
    probabilities,
  };
}
