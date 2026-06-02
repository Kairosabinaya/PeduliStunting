import { describe, expect, it } from "vitest";

import { resolveEditTarget } from "./tracker-edit-target";

const children = [{ id: "child-a" }, { id: "child-b" }] as const;

describe("resolveEditTarget", () => {
  it("returns the exact child requested via ?anak=", () => {
    expect(resolveEditTarget(children, "child-b", "edit")?.id).toBe("child-b");
  });

  it("returns null when ?anak= matches no child (never falls back to the first)", () => {
    // A stale/foreign/deleted id must not silently open the editor on child[0]
    // and risk overwriting the wrong child's profile.
    expect(resolveEditTarget(children, "unknown-id", "edit")).toBeNull();
  });

  it("returns null when ?anak= is absent", () => {
    expect(resolveEditTarget(children, undefined, "edit")).toBeNull();
  });

  it("returns null when the modal is not the edit modal", () => {
    expect(resolveEditTarget(children, "child-a", undefined)).toBeNull();
    expect(resolveEditTarget(children, "child-a", "imunisasi")).toBeNull();
  });
});
