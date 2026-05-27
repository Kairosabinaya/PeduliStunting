import { describe, expect, it } from "vitest";

import { geometryToPath, isPolygonLike } from "./path-builder";
import { makeProjector } from "./projection";

const project = makeProjector(
  { minLon: 0, maxLon: 10, minLat: 0, maxLat: 10 },
  { width: 100, height: 100 },
);

describe("isPolygonLike", () => {
  it("recognises Polygon and MultiPolygon", () => {
    expect(isPolygonLike({ type: "Polygon", coordinates: [] })).toBe(true);
    expect(isPolygonLike({ type: "MultiPolygon", coordinates: [] })).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isPolygonLike(null)).toBe(false);
    expect(isPolygonLike(undefined)).toBe(false);
    expect(isPolygonLike({ type: "Point", coordinates: [0, 0] })).toBe(false);
    expect(isPolygonLike({ type: "Polygon" })).toBe(false);
    expect(isPolygonLike("polygon")).toBe(false);
  });
});

describe("geometryToPath", () => {
  it("produces a closed SVG path for a Polygon ring", () => {
    const path = geometryToPath(
      {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      },
      project,
    );
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    // 5 vertices → 1 moveTo + 4 lineTo + Z
    expect((path.match(/L/g) ?? []).length).toBe(4);
  });

  it("concatenates multiple rings inside a single Polygon", () => {
    const path = geometryToPath(
      {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 0],
          ],
          [
            [6, 6],
            [10, 6],
            [10, 10],
            [6, 6],
          ],
        ],
      },
      project,
    );
    expect((path.match(/Z/g) ?? []).length).toBe(2);
  });

  it("expands a MultiPolygon into one path with several subpaths", () => {
    const path = geometryToPath(
      {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [0, 0],
              [5, 0],
              [5, 5],
              [0, 0],
            ],
          ],
          [
            [
              [6, 6],
              [10, 6],
              [10, 10],
              [6, 6],
            ],
          ],
        ],
      },
      project,
    );
    expect((path.match(/M/g) ?? []).length).toBe(2);
    expect((path.match(/Z/g) ?? []).length).toBe(2);
  });

  it("returns an empty string for non-polygon input", () => {
    expect(geometryToPath(null, project)).toBe("");
    expect(geometryToPath({ type: "Point", coordinates: [0, 0] }, project)).toBe(
      "",
    );
  });

  it("skips empty rings without throwing", () => {
    const path = geometryToPath(
      { type: "Polygon", coordinates: [[]] },
      project,
    );
    expect(path).toBe("");
  });
});
