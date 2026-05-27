import { describe, expect, it } from "vitest";

import { classify, type SdClass } from "./sd-classification";
import type { GrowthIndicator } from "./growth-indicator";

type Row = readonly [GrowthIndicator, number, SdClass];

const cases: readonly Row[] = [
  // BB_U weight-for-age
  ["BB_U", -3.5, "buruk"],
  ["BB_U", -3.0001, "buruk"],
  ["BB_U", -3, "kurang"],
  ["BB_U", -2.5, "kurang"],
  ["BB_U", -2, "normal"],
  ["BB_U", 0, "normal"],
  ["BB_U", 1, "normal"],
  ["BB_U", 1.001, "lebih"],
  ["BB_U", 5, "lebih"],
  // TB_U height-for-age
  ["TB_U", -3.5, "sangat_pendek"],
  ["TB_U", -3, "pendek"],
  ["TB_U", -2.5, "pendek"],
  ["TB_U", -2, "normal"],
  ["TB_U", 0, "normal"],
  ["TB_U", 3, "normal"],
  ["TB_U", 3.0001, "tinggi"],
  ["TB_U", 5, "tinggi"],
  // BB_TB weight-for-length/height
  ["BB_TB", -3.5, "sangat_kurus"],
  ["BB_TB", -3, "kurus"],
  ["BB_TB", -2.5, "kurus"],
  ["BB_TB", -2, "normal"],
  ["BB_TB", 0, "normal"],
  ["BB_TB", 1, "normal"],
  ["BB_TB", 1.5, "gemuk"],
  ["BB_TB", 2, "gemuk"],
  ["BB_TB", 2.5, "lebih"],
  ["BB_TB", 3, "lebih"],
  ["BB_TB", 3.0001, "obesitas"],
  ["BB_TB", 5, "obesitas"],
  // LK_U head-circumference-for-age
  ["LK_U", -3, "mikrosefali"],
  ["LK_U", -2.0001, "mikrosefali"],
  ["LK_U", -2, "normal"],
  ["LK_U", 0, "normal"],
  ["LK_U", 2, "normal"],
  ["LK_U", 2.0001, "makrosefali"],
];

describe("classify", () => {
  it.each(cases)("classifies %s at z=%s as %s", (indicator, z, expected) => {
    expect(classify(indicator, z)).toBe(expected);
  });
});
