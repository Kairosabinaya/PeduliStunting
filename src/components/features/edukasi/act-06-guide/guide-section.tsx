"use client";

import { useRef } from "react";
import { motion } from "motion/react";

import { GUIDE_COPY } from "@/config/edukasi";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";
import { LandingOrb } from "../primitives/landing-orb";
import { ParallaxLayer } from "../primitives/parallax-layer";

import { AgeTabs } from "./age-tabs";

/**
 * ACT 6 — Panduan praktis per usia. Shell-level intro + the AgeTabs
 * client widget. Background gets ambient parallax orbs so the dense tabbed
 * content sits over a quiet but living surface.
 */
export function GuideSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <ActSection
      ref={sectionRef}
      id="act-6"
      eyebrow={GUIDE_COPY.eyebrow}
      maxWidth="wide"
    >
      <ParallaxLayer sectionRef={sectionRef}>
        {({ deepY, midY }) => (
          <>
            <motion.div
              style={{ y: deepY }}
              className="absolute right-0 top-16"
            >
              <LandingOrb tint="primary" size="lg" />
            </motion.div>
            <motion.div
              style={{ y: midY }}
              className="absolute -left-12 bottom-20"
            >
              <LandingOrb tint="accent" size="md" />
            </motion.div>
          </>
        )}
      </ParallaxLayer>

      <div className="relative z-10">
        <FadeInView as="div" className="max-w-prose">
          <h2 className="section-headline text-balance text-foreground">
            <span>{GUIDE_COPY.headlineLead}</span>{" "}
            <HighlightWord variant={GUIDE_COPY.headlineHighlight.variant}>
              {GUIDE_COPY.headlineHighlight.value}
            </HighlightWord>
            <span>{GUIDE_COPY.headlineMid}</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            {GUIDE_COPY.body}
          </p>
        </FadeInView>

        <div className="mt-12">
          <AgeTabs />
        </div>
      </div>
    </ActSection>
  );
}
