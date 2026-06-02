import { describe, expect, it } from "vitest";

import { lastUserText, referencesScreen } from "./screen-reference";

describe("referencesScreen", () => {
  it("detects on-screen references (saves no tokens)", () => {
    expect(referencesScreen("jelaskan rumus ini")).toBe(true);
    expect(referencesScreen("apa arti grafik di atas?")).toBe(true);
    expect(referencesScreen("maksud tabel yang tampil itu apa")).toBe(true);
  });

  it("returns false for self-contained questions (skip screen text)", () => {
    expect(referencesScreen("apa itu stunting")).toBe(false);
    expect(referencesScreen("bandingkan Surabaya dan Malang 2024")).toBe(false);
  });
});

describe("lastUserText", () => {
  it("returns the most recent user message text", () => {
    const text = lastUserText([
      { role: "user", parts: [{ type: "text", text: "halo" }] },
      { role: "assistant", parts: [{ type: "text", text: "hai" }] },
      { role: "user", parts: [{ type: "text", text: "rumus ini" }] },
    ]);
    expect(text).toBe("rumus ini");
  });

  it("returns empty string when there is no user message", () => {
    expect(
      lastUserText([
        { role: "assistant", parts: [{ type: "text", text: "x" }] },
      ]),
    ).toBe("");
  });
});
