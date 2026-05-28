import { describe, expect, it } from "vitest";

import { splitTextWord } from "./hero-headline";

describe("splitTextWord", () => {
  it("emits words and whitespace as separate tokens", () => {
    expect(splitTextWord("1 dari 5")).toEqual(["1", " ", "dari", " ", "5"]);
  });

  it("handles two-word phrases", () => {
    expect(splitTextWord("balita Indonesia")).toEqual([
      "balita",
      " ",
      "Indonesia",
    ]);
  });

  it("returns a single token when no whitespace is present", () => {
    expect(splitTextWord("stunting")).toEqual(["stunting"]);
  });

  it("treats em-dash standalone as its own token", () => {
    expect(splitTextWord("—")).toEqual(["—"]);
    expect(splitTextWord("a — b")).toEqual(["a", " ", "—", " ", "b"]);
  });

  it("preserves the original whitespace shape (consecutive spaces stay together)", () => {
    expect(splitTextWord("a  b")).toEqual(["a", "  ", "b"]);
  });

  it('returns [""] for empty input so downstream renderers stay safe', () => {
    expect(splitTextWord("")).toEqual([""]);
  });

  it("emits leading and trailing whitespace as their own tokens", () => {
    expect(splitTextWord(" hello ")).toEqual([" ", "hello", " "]);
  });
});
