import { describe, expect, it } from "vitest";

import {
  TIMELINE_FRAMES,
  TIMELINE_TOTAL_DAYS,
  resolveTimelineFrame,
} from "./timeline";

describe("TIMELINE_FRAMES", () => {
  it("covers the entire 0–1000 day range without gaps", () => {
    for (let i = 0; i < TIMELINE_FRAMES.length - 1; i += 1) {
      const current = TIMELINE_FRAMES[i];
      const next = TIMELINE_FRAMES[i + 1];
      if (!current || !next) throw new Error("unexpected gap");
      expect(current.endDayExclusive).toBe(next.startDay);
    }
  });

  it("first frame starts at day 0", () => {
    expect(TIMELINE_FRAMES[0]?.startDay).toBe(0);
  });

  it("last frame's exclusive end is past TIMELINE_TOTAL_DAYS so day 1000 selects it", () => {
    const last = TIMELINE_FRAMES[TIMELINE_FRAMES.length - 1];
    expect(last?.endDayExclusive).toBeGreaterThan(TIMELINE_TOTAL_DAYS);
  });
});

describe("resolveTimelineFrame", () => {
  it("returns trimester 1 for day 0", () => {
    expect(resolveTimelineFrame(0).id).toBe("frame-trimester-1");
  });

  it("returns trimester 3 for day 200", () => {
    expect(resolveTimelineFrame(200).id).toBe("frame-trimester-3");
  });

  it("returns 0–6 months at the threshold day 271", () => {
    expect(resolveTimelineFrame(271).id).toBe("frame-0-6-months");
  });

  it("returns 12–24 months at day 800", () => {
    expect(resolveTimelineFrame(800).id).toBe("frame-12-24-months");
  });

  it("clamps to last frame at day 1000", () => {
    expect(resolveTimelineFrame(TIMELINE_TOTAL_DAYS).id).toBe(
      "frame-12-24-months",
    );
  });

  it("clamps to last frame for overshoot", () => {
    expect(resolveTimelineFrame(2000).id).toBe("frame-12-24-months");
  });

  it("clamps to first frame for negative input", () => {
    expect(resolveTimelineFrame(-5).id).toBe("frame-trimester-1");
  });
});
