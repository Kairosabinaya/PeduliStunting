import type { GrowthIndicator } from "../value-objects/growth-indicator";
import type { LmsParams } from "../value-objects/lms-params";
import type { Sex } from "../value-objects/sex";
import { classify, type SdClass } from "../value-objects/sd-classification";
import { computeZScore } from "./z-score-calculator";

/**
 * Inputs supplied directly by the user via the "Cek Cepat" banner. Fields
 * optional because the banner can be used incrementally — the calculator
 * skips indicators whose inputs are missing rather than rejecting the call.
 *
 * `weightKg` and `heightCm` MUST be positive when supplied; the calling
 * application layer validates this before reaching the domain service.
 */
export interface QuickScreeningInput {
  readonly sex: Sex;
  readonly ageMonths: number;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
}

/**
 * LMS rows resolved for the current input. Each row may be null if the LMS
 * lookup did not find a match (e.g. tabel `growth_standards` belum di-seed
 * untuk usia/length tersebut). The screening tolerates partial coverage.
 */
export interface QuickScreeningLms {
  readonly bbU: LmsParams | null;
  readonly tbU: LmsParams | null;
  readonly bbTb: LmsParams | null;
}

export interface IndicatorOutcome {
  readonly indicator: GrowthIndicator;
  readonly zScore: number;
  readonly sdClass: SdClass;
}

export interface QuickScreeningResult {
  /**
   * The TB/U (stunting) outcome is the headline of the result. Null when
   * either height was missing or no LMS row was available for the age.
   */
  readonly stunting: IndicatorOutcome | null;
  readonly supporting: readonly IndicatorOutcome[];
}

/**
 * Stateless calculator that converts user-supplied screening inputs and the
 * accompanying LMS rows into z-scores plus Buku KIA / Permenkes SD classes.
 *
 * Pure: no IO, no clock dependency. Exists in the domain layer so the same
 * calculation can be reused by Server Actions, Route Handlers, and tests
 * without duplicating the orchestration logic.
 */
export function computeQuickScreening(
  input: QuickScreeningInput,
  lms: QuickScreeningLms,
): QuickScreeningResult {
  let stunting: IndicatorOutcome | null = null;
  const supporting: IndicatorOutcome[] = [];

  if (input.heightCm !== null && lms.tbU !== null) {
    const z = safeZ(input.heightCm, lms.tbU);
    if (z !== null) {
      stunting = { indicator: "TB_U", zScore: z, sdClass: classify("TB_U", z) };
    }
  }

  if (input.weightKg !== null && lms.bbU !== null) {
    const z = safeZ(input.weightKg, lms.bbU);
    if (z !== null) {
      supporting.push({
        indicator: "BB_U",
        zScore: z,
        sdClass: classify("BB_U", z),
      });
    }
  }

  if (input.weightKg !== null && input.heightCm !== null && lms.bbTb !== null) {
    const z = safeZ(input.weightKg, lms.bbTb);
    if (z !== null) {
      supporting.push({
        indicator: "BB_TB",
        zScore: z,
        sdClass: classify("BB_TB", z),
      });
    }
  }

  return { stunting, supporting };
}

function safeZ(value: number, lms: LmsParams): number | null {
  if (value <= 0) return null;
  try {
    return computeZScore(value, lms);
  } catch {
    return null;
  }
}
