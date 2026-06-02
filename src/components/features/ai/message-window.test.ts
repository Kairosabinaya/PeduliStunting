import { describe, expect, it } from "vitest";

import { computeVisibleMessages } from "./message-window";

const u = { role: "user" } as const;
const a = { role: "assistant" } as const;

describe("computeVisibleMessages", () => {
  it("shows all when there are 2 or fewer messages", () => {
    expect(computeVisibleMessages([u, a], false)).toEqual({
      visible: [u, a],
      hidden: 0,
    });
    expect(computeVisibleMessages([u], false)).toEqual({
      visible: [u],
      hidden: 0,
    });
  });

  it("collapses to the latest user + assistant when more than 2", () => {
    const result = computeVisibleMessages([u, a, u, a], false);
    expect(result.hidden).toBe(2);
    expect(result.visible).toEqual([u, a]);
  });

  it("shows all when expanded", () => {
    const all = [u, a, u, a];
    expect(computeVisibleMessages(all, true)).toEqual({
      visible: all,
      hidden: 0,
    });
  });

  it("handles a trailing user message while the reply streams", () => {
    const result = computeVisibleMessages([u, a, u], false);
    expect(result.hidden).toBe(1);
    expect(result.visible).toEqual([a, u]);
  });
});
