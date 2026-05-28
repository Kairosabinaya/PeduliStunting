import { describe, expect, it } from "vitest";

import { initialsOf } from "./initials";

describe("initialsOf", () => {
  it("uses the first letter of the first and last name", () => {
    expect(initialsOf("Budi Santoso")).toBe("BS");
  });

  it("falls back to single initial when the name is one word", () => {
    expect(initialsOf("Sari")).toBe("S");
  });

  it("collapses internal whitespace", () => {
    expect(initialsOf("  Budi   Santoso  ")).toBe("BS");
  });

  it("uses the first two characters of the email when name is empty", () => {
    expect(initialsOf("", "anita@example.com")).toBe("AN");
  });

  it("uses the email branch when display name is null", () => {
    expect(initialsOf(null, "h@example.com")).toBe("H@");
  });

  it("returns PS when neither name nor email is usable", () => {
    expect(initialsOf(null, null)).toBe("PS");
    expect(initialsOf("   ", "")).toBe("PS");
  });

  it("uppercases lowercase input", () => {
    expect(initialsOf("budi santoso")).toBe("BS");
  });
});
