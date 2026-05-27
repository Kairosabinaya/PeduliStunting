import type { IndicatorCode } from "@/domain/shared/ids";
import type { KodeBps } from "../value-objects/kode-bps";
import type { StuntingCategory } from "../value-objects/stunting-category";
import type { Year } from "../value-objects/year";

/**
 * Panel observation for one region in one year. Carries the BPS outcome
 * category, the prevalence percent, and the 20 model predictors.
 *
 * Predictors are stored in a `Map` keyed by {@link IndicatorCode} so callers
 * never index by hardcoded `x1..x20` strings.
 */
export class RegionIndicators {
  readonly kodeBps: KodeBps;
  readonly tahun: Year;
  readonly yCategory: StuntingCategory;
  readonly y1Prevalence: number | null;
  readonly predictors: ReadonlyMap<IndicatorCode, number | null>;

  constructor(props: {
    kodeBps: KodeBps;
    tahun: Year;
    yCategory: StuntingCategory;
    y1Prevalence: number | null;
    predictors: ReadonlyMap<IndicatorCode, number | null>;
  }) {
    this.kodeBps = props.kodeBps;
    this.tahun = props.tahun;
    this.yCategory = props.yCategory;
    this.y1Prevalence = props.y1Prevalence;
    this.predictors = props.predictors;
  }
}
