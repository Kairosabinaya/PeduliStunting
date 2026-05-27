import { describe, expect, it } from "vitest";

import {
  LANDING_CTA_BANNER,
  LANDING_FOOTER,
  LANDING_HERO,
  LANDING_LOGO,
  LANDING_MODEL_SNAPSHOT,
  LANDING_PILLARS,
  LANDING_PILLARS_HEADER,
  LANDING_TRUST_HEADER,
  LANDING_TRUST_POINTS,
  type LandingPillarKey,
  type LandingPillarTone,
} from "./landing";

const PILLAR_KEYS = new Set<LandingPillarKey>([
  "map",
  "edukasi",
  "tracker",
  "dashboard",
]);

const PILLAR_TONES = new Set<LandingPillarTone>([
  "primary",
  "primary-soft",
  "accent",
]);

describe("landing config", () => {
  describe("LANDING_LOGO", () => {
    it("exposes a brand asset for both themes", () => {
      for (const variant of ["light", "dark"] as const) {
        const logo = LANDING_LOGO[variant];
        expect(logo.src.startsWith("/brand/")).toBe(true);
        expect(logo.src.endsWith(".png")).toBe(true);
        expect(logo.width).toBeGreaterThan(0);
        expect(logo.height).toBeGreaterThan(0);
        expect(logo.alt.length).toBeGreaterThan(0);
      }
    });
  });

  describe("LANDING_HERO", () => {
    it("provides kicker, title, and description copy", () => {
      expect(LANDING_HERO.kicker.length).toBeGreaterThan(0);
      expect(LANDING_HERO.title.length).toBeGreaterThan(0);
      expect(LANDING_HERO.description.length).toBeGreaterThan(0);
    });

    it("routes the primary CTA to sign-up and the secondary CTA to sign-in", () => {
      expect(LANDING_HERO.primaryCta.href).toBe("/auth/sign-up");
      expect(LANDING_HERO.secondaryCta.href).toBe("/auth/sign-in");
      expect(LANDING_HERO.primaryCta.label.length).toBeGreaterThan(0);
      expect(LANDING_HERO.secondaryCta.label.length).toBeGreaterThan(0);
    });
  });

  describe("LANDING_MODEL_SNAPSHOT", () => {
    it("describes the GTWENOLR model with at least three highlighted facts", () => {
      expect(LANDING_MODEL_SNAPSHOT.name).toBe("GTWENOLR");
      expect(LANDING_MODEL_SNAPSHOT.facts.length).toBeGreaterThanOrEqual(3);
      for (const fact of LANDING_MODEL_SNAPSHOT.facts) {
        expect(fact.label.length).toBeGreaterThan(0);
        expect(fact.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe("LANDING_PILLARS", () => {
    it("covers all four product domains exactly once", () => {
      expect(LANDING_PILLARS).toHaveLength(4);
      const keys = LANDING_PILLARS.map((pillar) => pillar.key);
      expect(new Set(keys).size).toBe(4);
      for (const key of keys) {
        expect(PILLAR_KEYS.has(key)).toBe(true);
      }
    });

    it("uses tones from the approved palette and provides supporting bullets", () => {
      for (const pillar of LANDING_PILLARS) {
        expect(PILLAR_TONES.has(pillar.tone)).toBe(true);
        expect(pillar.title.length).toBeGreaterThan(0);
        expect(pillar.description.length).toBeGreaterThan(0);
        expect(pillar.bullets.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("introduces the pillars section with a heading and a lead paragraph", () => {
      expect(LANDING_PILLARS_HEADER.title.length).toBeGreaterThan(0);
      expect(LANDING_PILLARS_HEADER.description.length).toBeGreaterThan(0);
    });
  });

  describe("LANDING_TRUST_POINTS", () => {
    it("provides at least three reassurance points with a header", () => {
      expect(LANDING_TRUST_HEADER.title.length).toBeGreaterThan(0);
      expect(LANDING_TRUST_HEADER.description.length).toBeGreaterThan(0);
      expect(LANDING_TRUST_POINTS.length).toBeGreaterThanOrEqual(3);
      for (const point of LANDING_TRUST_POINTS) {
        expect(point.title.length).toBeGreaterThan(0);
        expect(point.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("LANDING_CTA_BANNER", () => {
    it("converts visitors via the sign-up route", () => {
      expect(LANDING_CTA_BANNER.title.length).toBeGreaterThan(0);
      expect(LANDING_CTA_BANNER.description.length).toBeGreaterThan(0);
      expect(LANDING_CTA_BANNER.cta.href).toBe("/auth/sign-up");
    });
  });

  describe("LANDING_FOOTER", () => {
    it("labels the locale as Indonesian", () => {
      expect(LANDING_FOOTER.tagline.length).toBeGreaterThan(0);
      expect(LANDING_FOOTER.note.length).toBeGreaterThan(0);
      expect(LANDING_FOOTER.locale).toContain("Bahasa Indonesia");
    });
  });
});
