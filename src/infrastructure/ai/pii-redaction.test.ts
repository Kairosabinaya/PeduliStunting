import { describe, expect, it } from "vitest";

import { redactSelectionForLog } from "./pii-redaction";

describe("redactSelectionForLog", () => {
  it("reduces identifiers to booleans and never logs the childId", () => {
    const out = redactSelectionForLog({
      pageId: "tracker",
      childId: "secret-child-id",
      kodeBps: "3578",
    });
    expect(out).toEqual({
      pageId: "tracker",
      hasKodeBps: true,
      hasTahun: false,
      hasChild: true,
    });
    expect(JSON.stringify(out)).not.toContain("secret-child-id");
  });
});
