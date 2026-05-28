import { describe, expect, it } from "vitest";

import {
  EDUKASI_FOOTNOTES,
  EDUKASI_FOOTNOTE_INDEX,
  getEdukasiFootnoteNumber,
} from "./footnotes";

describe("EDUKASI_FOOTNOTES", () => {
  it("has unique ids", () => {
    const ids = EDUKASI_FOOTNOTES.map((entry) => entry.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("ids follow the documented fn-<slug> format", () => {
    EDUKASI_FOOTNOTES.forEach((entry) => {
      expect(entry.id).toMatch(/^fn-[a-z0-9-]+$/);
    });
  });

  it("every entry has a non-empty label and note", () => {
    EDUKASI_FOOTNOTES.forEach((entry) => {
      expect(entry.label.trim().length).toBeGreaterThan(0);
      expect(entry.note.trim().length).toBeGreaterThan(0);
    });
  });
});

describe("EDUKASI_FOOTNOTE_INDEX", () => {
  it("contains every footnote keyed by its id", () => {
    EDUKASI_FOOTNOTES.forEach((entry) => {
      expect(EDUKASI_FOOTNOTE_INDEX[entry.id]).toBe(entry);
    });
  });
});

describe("getEdukasiFootnoteNumber", () => {
  it("returns 1-based array position for known ids", () => {
    const first = EDUKASI_FOOTNOTES[0];
    if (!first) throw new Error("expected at least one footnote");
    expect(getEdukasiFootnoteNumber(first.id)).toBe(1);
  });

  it("returns null for unknown ids", () => {
    expect(getEdukasiFootnoteNumber("fn-does-not-exist")).toBeNull();
  });
});
