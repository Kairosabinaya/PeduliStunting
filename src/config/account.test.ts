import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DETAILS_COPY,
  ACCOUNT_EMPTY_STATE_COPY,
  ACCOUNT_ERROR_STATE_COPY,
  ACCOUNT_FORM_COPY,
  ACCOUNT_GENERIC_ERROR,
  ACCOUNT_PAGE_COPY,
  ACCOUNT_ROUTE,
  ACCOUNT_SIGN_OUT_COPY,
  LOCALE_OPTIONS,
  ROLE_LABEL,
  THEME_LABEL,
  THEME_OPTIONS,
} from "./account";
import { SUPPORTED_LOCALES } from "./locales";
import {
  THEME_PREFERENCES,
  USER_ROLES,
} from "@/domain/account/entities/user-profile";

describe("account config", () => {
  it("exposes the canonical account route", () => {
    expect(ACCOUNT_ROUTE).toBe("/account");
  });

  it("provides non-empty copy for every page section", () => {
    const sections = [
      ACCOUNT_PAGE_COPY,
      ACCOUNT_FORM_COPY,
      ACCOUNT_DETAILS_COPY,
      ACCOUNT_SIGN_OUT_COPY,
      ACCOUNT_EMPTY_STATE_COPY,
      ACCOUNT_ERROR_STATE_COPY,
    ];
    for (const section of sections) {
      for (const value of Object.values(section)) {
        expect(typeof value).toBe("string");
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });

  it("provides a non-empty generic error message", () => {
    expect(ACCOUNT_GENERIC_ERROR.length).toBeGreaterThan(0);
  });

  it("THEME_OPTIONS mirrors THEME_PREFERENCES in order and identity", () => {
    expect(THEME_OPTIONS.map((o) => o.value)).toEqual([...THEME_PREFERENCES]);
    for (const option of THEME_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it("THEME_LABEL covers every preference", () => {
    for (const value of THEME_PREFERENCES) {
      expect(THEME_LABEL[value]).toBeDefined();
      expect(THEME_LABEL[value].length).toBeGreaterThan(0);
    }
  });

  it("LOCALE_OPTIONS mirrors SUPPORTED_LOCALES", () => {
    expect(LOCALE_OPTIONS.map((o) => o.value)).toEqual([...SUPPORTED_LOCALES]);
    for (const option of LOCALE_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it("ROLE_LABEL covers every user role with a non-empty label", () => {
    for (const role of USER_ROLES) {
      expect(ROLE_LABEL[role]).toBeDefined();
      expect(ROLE_LABEL[role].length).toBeGreaterThan(0);
    }
  });
});
