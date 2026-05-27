import type { LmsParams } from "../value-objects/lms-params";

/**
 * Computes the WHO LMS z-score for a measurement.
 *
 * The WHO Box-Cox formulation:
 *
 * - When `L != 0`:
 *     `z = ((x / M) ^ L - 1) / (L * S)`
 * - When `L == 0`:
 *     `z = ln(x / M) / S`
 *
 * Reference: WHO Multicentre Growth Reference Study (2006).
 *
 * Values beyond ±3 SD are returned as the "modified z-score" recommended by
 * the WHO Anthro reference implementation:
 *
 * - For `z > 3`:  `z* = 3 + (x - SD3pos) / (SD3pos - SD2pos)`
 * - For `z < -3`: `z* = -3 + (x - SD3neg) / (SD2neg - SD3neg)`
 *
 * This keeps tails finite and comparable across indicators while preserving
 * the sign of extreme deviations, which is required by Permenkes / Buku KIA
 * for stunting and wasting classification.
 *
 * @param measurement The observed value (kg, cm, or cm depending on indicator).
 * @param params      The LMS row for the lookup key.
 * @returns           Z-score as a finite number.
 *
 * @example
 * ```ts
 * const z = computeZScore(8.4, lmsRow);
 * ```
 */
export function computeZScore(measurement: number, params: LmsParams): number {
  if (measurement <= 0) {
    throw new Error("Measurement must be positive.");
  }
  const { l, m, s } = params;
  const rawZ = l === 0 ? Math.log(measurement / m) / s : (Math.pow(measurement / m, l) - 1) / (l * s);
  if (!Number.isFinite(rawZ)) {
    throw new Error("Z-score computation produced a non-finite value.");
  }
  if (rawZ > 3) {
    const sd3pos = sdValue(params, 3);
    const sd2pos = sdValue(params, 2);
    const denom = sd3pos - sd2pos;
    return denom === 0 ? rawZ : 3 + (measurement - sd3pos) / denom;
  }
  if (rawZ < -3) {
    const sd3neg = sdValue(params, -3);
    const sd2neg = sdValue(params, -2);
    const denom = sd2neg - sd3neg;
    return denom === 0 ? rawZ : -3 + (measurement - sd3neg) / denom;
  }
  return rawZ;
}

/**
 * Inverse of the WHO LMS transform: returns the measurement value that
 * corresponds to a given z-score. Used internally for tail correction and is
 * exported because the growth-chart renderer needs the ±2/±3 SD curves.
 */
export function sdValue(params: LmsParams, z: number): number {
  const { l, m, s } = params;
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l);
}

export class ZScoreCalculator {
  compute(measurement: number, params: LmsParams): number {
    return computeZScore(measurement, params);
  }
}
