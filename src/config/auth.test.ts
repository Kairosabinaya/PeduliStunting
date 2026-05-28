import { describe, expect, it } from "vitest";

import {
  AUTH_BRAND_PANEL,
  AUTH_ERROR_MESSAGES,
  AUTH_EYEBROW,
  AUTH_FALLBACK_ERROR,
  AUTH_LABELS,
  AUTH_MAP_PREVIEW_COPY,
  AUTH_STATS,
  AUTH_SUCCESS_MESSAGES,
  RESET_PASSWORD_COPY,
  SIGN_IN_COPY,
  SIGN_UP_COPY,
  UPDATE_PASSWORD_COPY,
  getAuthErrorMessage,
} from "./auth";

describe("auth config", () => {
  describe("AUTH_BRAND_PANEL", () => {
    it("points at a public brand asset with sensible dimensions", () => {
      expect(AUTH_BRAND_PANEL.logo.src.startsWith("/brand/")).toBe(true);
      expect(AUTH_BRAND_PANEL.logo.src.endsWith(".png")).toBe(true);
      expect(AUTH_BRAND_PANEL.logo.width).toBeGreaterThan(0);
      expect(AUTH_BRAND_PANEL.logo.height).toBeGreaterThan(0);
      expect(AUTH_BRAND_PANEL.logo.alt.length).toBeGreaterThan(0);
      expect(AUTH_BRAND_PANEL.headline.length).toBeGreaterThan(0);
      expect(AUTH_BRAND_PANEL.source.length).toBeGreaterThan(0);
    });
  });

  describe("page copy", () => {
    it("routes sign-in footer to sign-up and vice versa", () => {
      expect(SIGN_IN_COPY.footerLink.href).toBe("/auth/sign-up");
      expect(SIGN_UP_COPY.footerLink.href).toBe("/auth/sign-in");
    });

    it("routes reset footer back to sign-in", () => {
      expect(RESET_PASSWORD_COPY.footerLink.href).toBe("/auth/sign-in");
    });

    it("routes update footer back to sign-in", () => {
      expect(UPDATE_PASSWORD_COPY.footerLink.href).toBe("/auth/sign-in");
    });

    it("provides title, eyebrow, and description copy for every auth page", () => {
      for (const copy of [
        SIGN_IN_COPY,
        SIGN_UP_COPY,
        RESET_PASSWORD_COPY,
        UPDATE_PASSWORD_COPY,
      ]) {
        expect(copy.metaTitle.length).toBeGreaterThan(0);
        expect(copy.eyebrow.length).toBeGreaterThan(0);
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("brand panel data", () => {
    it("exposes a distinct eyebrow constant", () => {
      expect(AUTH_EYEBROW.length).toBeGreaterThan(0);
    });

    it("provides three stats with value + label", () => {
      expect(AUTH_STATS).toHaveLength(3);
      for (const stat of AUTH_STATS) {
        expect(stat.value.length).toBeGreaterThan(0);
        expect(stat.label.length).toBeGreaterThan(0);
      }
    });

    it("provides map preview copy with title, caption, and alt", () => {
      expect(AUTH_MAP_PREVIEW_COPY.title.length).toBeGreaterThan(0);
      expect(AUTH_MAP_PREVIEW_COPY.caption.length).toBeGreaterThan(0);
      expect(AUTH_MAP_PREVIEW_COPY.alt.length).toBeGreaterThan(0);
    });
  });

  describe("AUTH_LABELS", () => {
    it("provides distinct submit labels per flow", () => {
      const labels = [
        AUTH_LABELS.signInSubmit,
        AUTH_LABELS.signUpSubmit,
        AUTH_LABELS.resetSubmit,
        AUTH_LABELS.updateSubmit,
      ];
      expect(new Set(labels).size).toBe(labels.length);
    });

    it("provides separate Google CTAs for sign-in vs sign-up", () => {
      expect(AUTH_LABELS.google.signIn).not.toBe(AUTH_LABELS.google.signUp);
    });
  });

  describe("AUTH_SUCCESS_MESSAGES", () => {
    it("covers sign-up verification, reset link, and password update", () => {
      expect(AUTH_SUCCESS_MESSAGES.signUpVerifyEmail.length).toBeGreaterThan(0);
      expect(AUTH_SUCCESS_MESSAGES.resetLinkSent.length).toBeGreaterThan(0);
      expect(AUTH_SUCCESS_MESSAGES.passwordUpdated.length).toBeGreaterThan(0);
    });
  });

  describe("getAuthErrorMessage", () => {
    it("returns null for nullish input", () => {
      expect(getAuthErrorMessage(null)).toBeNull();
      expect(getAuthErrorMessage(undefined)).toBeNull();
      expect(getAuthErrorMessage("")).toBeNull();
    });

    it("returns the mapped message for known codes", () => {
      for (const code of Object.keys(AUTH_ERROR_MESSAGES)) {
        const value = AUTH_ERROR_MESSAGES[code];
        expect(value).toBeDefined();
        expect(getAuthErrorMessage(code)).toBe(value);
      }
    });

    it("falls back to the generic error for unknown codes", () => {
      expect(getAuthErrorMessage("definitely_not_a_code")).toBe(
        AUTH_FALLBACK_ERROR,
      );
    });
  });
});
