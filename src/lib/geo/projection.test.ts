import { describe, expect, it } from "vitest";

import { makeProjector } from "./projection";

const BBOX = { minLon: 94.5, maxLon: 141.5, minLat: -11.5, maxLat: 6.5 };
const VIEW = { width: 1000, height: 380 };

describe("makeProjector", () => {
  const project = makeProjector(BBOX, VIEW);

  it("maps the bbox corners inside the viewBox", () => {
    const topLeft = project([BBOX.minLon, BBOX.maxLat]);
    const bottomRight = project([BBOX.maxLon, BBOX.minLat]);
    expect(topLeft.x).toBeGreaterThanOrEqual(0);
    expect(topLeft.y).toBeGreaterThanOrEqual(0);
    expect(bottomRight.x).toBeLessThanOrEqual(VIEW.width);
    expect(bottomRight.y).toBeLessThanOrEqual(VIEW.height);
  });

  it("centres higher latitudes nearer the top of the viewBox", () => {
    const north = project([110, 5]);
    const south = project([110, -10]);
    expect(north.y).toBeLessThan(south.y);
  });

  it("places easterly points to the right of westerly points", () => {
    const east = project([140, 0]);
    const west = project([100, 0]);
    expect(east.x).toBeGreaterThan(west.x);
  });

  it("preserves the bbox aspect ratio (lon span fills width on Indonesia)", () => {
    const lonSpan = BBOX.maxLon - BBOX.minLon;
    const latSpan = BBOX.maxLat - BBOX.minLat;
    const scaleX = VIEW.width / lonSpan;
    const scaleY = VIEW.height / latSpan;
    const scale = Math.min(scaleX, scaleY);

    const left = project([BBOX.minLon, 0]);
    const right = project([BBOX.maxLon, 0]);
    expect(right.x - left.x).toBeCloseTo(lonSpan * scale, 4);
  });

  it("rejects a degenerate bbox", () => {
    expect(() => makeProjector({ ...BBOX, minLon: BBOX.maxLon }, VIEW)).toThrow(
      /positive span/u,
    );
  });

  it("rejects a viewBox with non-positive dimensions", () => {
    expect(() => makeProjector(BBOX, { width: 0, height: 100 })).toThrow(
      /positive dimensions/u,
    );
  });
});
