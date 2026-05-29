"use client";

import { useReducedMotion } from "motion/react";

import { HISTORY_COPY } from "@/config/edukasi";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";
import { PinnedSection, usePinnedProgress } from "../primitives/pinned-section";

import { StuntingLineChart } from "./stunting-line-chart";

/**
 * ACT 3 — Indonesia's stunting journey. Refactored to a `PinnedSection`
 * (framesCount=2 → ~2 viewports of scroll) so the line chart traces 2013
 * to 2045 as the user scrolls through the section. Layout is stacked
 * vertically inside a single pinned viewport so the headline and
 * progressing line both stay visible at the same time.
 *
 * The chart component (`StuntingLineChart`) consumes scroll progress via
 * the prop `progress` so the same component works in any future stand-
 * alone embed (without progress prop = fully drawn).
 */
function HistoryInner() {
  const progress = usePinnedProgress();
  return (
    <div className="container relative mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-12">
      <FadeInView as="div" className="max-w-prose">
        <p className="eyebrow mb-4">{HISTORY_COPY.eyebrow}</p>
        <h2 className="section-headline text-balance text-foreground">
          <span>{HISTORY_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={HISTORY_COPY.headlineHighlights[0].variant}>
            {HISTORY_COPY.headlineHighlights[0].value}
          </HighlightWord>{" "}
          <HighlightWord variant={HISTORY_COPY.headlineHighlights[1].variant}>
            {HISTORY_COPY.headlineHighlights[1].value}
          </HighlightWord>{" "}
          <span>{HISTORY_COPY.headlineTail}</span>
        </h2>
        {HISTORY_COPY.body.map((paragraph, index) => {
          const footnoteId = HISTORY_COPY.bodyFootnoteIds[index];
          return (
            <p
              key={index}
              className="mt-5 text-base text-muted-foreground sm:text-lg"
            >
              <span>{paragraph}</span>
              {footnoteId ? <FootnoteRef id={footnoteId} /> : null}
            </p>
          );
        })}
      </FadeInView>
      <div>
        <StuntingLineChart progress={progress} />
      </div>
    </div>
  );
}

/**
 * Reduced-motion fallback: standard `ActSection` with the chart drawn in
 * its end-state (no scroll progress prop). Identical content, identical
 * layout, just no kinetic reveal.
 */
function ReducedMotionHistory() {
  return (
    <ActSection
      id="act-3"
      eyebrow={HISTORY_COPY.eyebrow}
      maxWidth="wide"
      className="bg-background"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <FadeInView as="div" className="max-w-prose">
          <h2 className="section-headline text-balance text-foreground">
            <span>{HISTORY_COPY.headlineLead}</span>{" "}
            <HighlightWord variant={HISTORY_COPY.headlineHighlights[0].variant}>
              {HISTORY_COPY.headlineHighlights[0].value}
            </HighlightWord>{" "}
            <HighlightWord variant={HISTORY_COPY.headlineHighlights[1].variant}>
              {HISTORY_COPY.headlineHighlights[1].value}
            </HighlightWord>{" "}
            <span>{HISTORY_COPY.headlineTail}</span>
          </h2>
          {HISTORY_COPY.body.map((paragraph, index) => {
            const footnoteId = HISTORY_COPY.bodyFootnoteIds[index];
            return (
              <p
                key={index}
                className="mt-5 text-base text-muted-foreground sm:text-lg"
              >
                <span>{paragraph}</span>
                {footnoteId ? <FootnoteRef id={footnoteId} /> : null}
              </p>
            );
          })}
        </FadeInView>
        <FadeInView as="div" delayMs={150}>
          <StuntingLineChart />
        </FadeInView>
      </div>
    </ActSection>
  );
}

export function HistorySection() {
  // The pinned scroll progression is the whole point of this ACT, so on
  // reduced-motion we render the simpler static layout. The chart
  // component itself respects reduced-motion (animates to end state
  // immediately) so the static branch is just simpler layout, not behaviour.
  // `useReducedMotion` is hydration-safe (returns null on first render,
  // boolean once `matchMedia` resolves) so we get no SSR/CSR mismatch.
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <ReducedMotionHistory />;
  return (
    <PinnedSection
      id="act-3"
      framesCount={2}
      tone="default"
      ariaLabel="Perjalanan prevalensi stunting Indonesia 2013 hingga 2045"
    >
      <HistoryInner />
    </PinnedSection>
  );
}
