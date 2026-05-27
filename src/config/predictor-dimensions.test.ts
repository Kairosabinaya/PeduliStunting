import { describe, expect, it } from "vitest";

import { INDICATOR_DIMENSIONS } from "@/domain/region/entities/indicator-definition";

import {
  PREDICTOR_DIMENSION_ORDER,
  getPredictorDimensionLabel,
  listPredictorDimensionLabels,
} from "./predictor-dimensions";

describe("predictor-dimensions config", () => {
  it("covers every domain dimension code with a label", () => {
    for (const code of INDICATOR_DIMENSIONS) {
      const label = getPredictorDimensionLabel(code);
      expect(label.code).toBe(code);
      expect(label.label.length).toBeGreaterThan(0);
      expect(label.description.length).toBeGreaterThan(0);
    }
  });

  it("orders the dimensions with outcome first", () => {
    expect(PREDICTOR_DIMENSION_ORDER[0]).toBe("outcome");
    expect(new Set(PREDICTOR_DIMENSION_ORDER).size).toBe(
      INDICATOR_DIMENSIONS.length,
    );
  });

  it("returns a fallback label for unknown codes without throwing", () => {
    const label = getPredictorDimensionLabel("unmapped_dimension");
    expect(label.label.length).toBeGreaterThan(0);
    expect(label.description.length).toBeGreaterThan(0);
  });

  it("returns the fallback label when called with null or undefined", () => {
    expect(getPredictorDimensionLabel(null).label).toBeTruthy();
    expect(getPredictorDimensionLabel(undefined).label).toBeTruthy();
  });

  it("listPredictorDimensionLabels returns labels in the declared order", () => {
    const list = listPredictorDimensionLabels();
    expect(list).toHaveLength(PREDICTOR_DIMENSION_ORDER.length);
    list.forEach((entry, index) => {
      expect(entry.code).toBe(PREDICTOR_DIMENSION_ORDER[index]);
    });
  });
});
