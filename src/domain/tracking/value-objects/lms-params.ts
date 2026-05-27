import type { GrowthIndicator } from "./growth-indicator";
import type { Sex } from "./sex";

/**
 * One row of the WHO LMS (Box-Cox / Lambda-Mu-Sigma) table.
 *
 * For age-based indicators (`BB_U`, `TB_U`, `LK_U`) the key is
 * `(indicator, sex, ageMonths)` and `xValue` is unused (stored as `0`).
 * For `BB_TB` the key is `(indicator, sex, xValue)` and `xValue` carries the
 * child's length/height in cm; `ageMonths` is ignored.
 */
export class LmsParams {
  readonly indicator: GrowthIndicator;
  readonly sex: Sex;
  readonly ageMonths: number;
  readonly xValue: number;
  readonly l: number;
  readonly m: number;
  readonly s: number;

  constructor(props: {
    indicator: GrowthIndicator;
    sex: Sex;
    ageMonths: number;
    xValue: number;
    l: number;
    m: number;
    s: number;
  }) {
    if (props.m <= 0) {
      throw new Error("LMS M must be > 0");
    }
    if (props.s <= 0) {
      throw new Error("LMS S must be > 0");
    }
    this.indicator = props.indicator;
    this.sex = props.sex;
    this.ageMonths = props.ageMonths;
    this.xValue = props.xValue;
    this.l = props.l;
    this.m = props.m;
    this.s = props.s;
  }
}
