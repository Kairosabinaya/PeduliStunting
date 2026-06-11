import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "./locales";

describe("locales config", () => {
  it("contains at least one supported locale", () => {
    expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
  });

  it("each entry matches the BCP-47 shape (xx or xx-XX)", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(/^[a-z]{2}(-[A-Z]{2})?$/u.test(locale)).toBe(true);
    }
  });

  it("the default locale is among supported locales", () => {
    expect(
      (SUPPORTED_LOCALES as readonly string[]).includes(DEFAULT_LOCALE),
    ).toBe(true);
  });

  it("isSupportedLocale narrows correctly", () => {
    expect(isSupportedLocale("id-ID")).toBe(true);
    expect(isSupportedLocale("en-US")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });
});
