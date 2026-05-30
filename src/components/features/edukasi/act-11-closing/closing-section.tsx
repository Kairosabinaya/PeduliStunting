"use client";

import Link from "next/link";
import { motion, useReducedMotion, useTransform } from "motion/react";

import { CLOSING_COPY, type ClosingHeadlineWord } from "@/config/edukasi";
import { buttonVariants } from "@/components/primitives/button";

import { FadeInView } from "../primitives/fade-in-view";
import { FootnoteList } from "../primitives/footnote-list";
import { HighlightWord } from "../primitives/highlight-word";
import { PinnedSection, usePinnedProgress } from "../primitives/pinned-section";

/**
 * ACT 11 — closing band + footnote drawer.
 *
 * Visual model: the closing surface is the "floor" of the page. If the
 * reader stops scrolling here they see a polished closing screen with
 * CTAs — feels like a footer. If they push past it, a drawer carrying
 * the source + footnote list slides up from the bottom like an Apple
 * Maps detail sheet, revealing the documentation that backs the entire
 * scrollytelling.
 *
 * Implemented as a `PinnedSection` framesCount=2 so we have ~2 viewport
 * heights of scroll to drive the drawer translation. Progress 0–0.5
 * keeps the drawer parked just out of view (95%), 0.5–1.0 slides it up
 * to 0% (fully revealed). Reduced-motion users get a static layout:
 * closing band followed by the footnote list rendered normally.
 */
export function ClosingSection() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <ReducedMotionClosing />;
  return (
    <PinnedSection
      id="act-11"
      framesCount={2}
      tone="dark"
      ariaLabel="Penutup dan sumber catatan"
    >
      <ClosingInner />
    </PinnedSection>
  );
}

function ClosingInner() {
  const progress = usePinnedProgress();
  // Drawer translation: parked at 95% (just a peek of the drawer handle
  // visible) until progress 0.5, then slides up linearly to 0% at the end.
  // This gives the user a clear cue ("there's more") without dominating
  // the closing screen.
  const drawerY = useTransform(progress, [0, 0.5, 1], ["95%", "95%", "0%"]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Closing content layer */}
      <ClosingContent />

      {/* Drawer layer — slides up over the closing as the user scrolls
          past it. `overflow-y-auto` inside the drawer body lets long
          footnote lists scroll independently of the page. */}
      <motion.div
        style={{ y: drawerY }}
        className="glass-panel-strong absolute inset-x-0 bottom-0 z-20 h-[88vh] overflow-hidden rounded-t-3xl shadow-2xl"
      >
        {/* Drag handle bar — affordance that the drawer can be scrolled
            further to reveal more. Purely visual; the actual scroll is
            driven by the section's own scroll progress. */}
        <div className="flex justify-center pt-3">
          <span
            aria-hidden="true"
            className="block h-1.5 w-12 rounded-full bg-muted-foreground/40"
          />
        </div>
        <div className="h-[calc(88vh-1.5rem)] overflow-y-auto">
          <FootnoteList />
        </div>
      </motion.div>
    </div>
  );
}

function ClosingContent() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p id="act-11-eyebrow-pinned" className="eyebrow text-white/70">
          {CLOSING_COPY.eyebrow}
        </p>
        <div className="mt-6">
          <h2 className="section-headline text-balance text-white">
            {CLOSING_COPY.headline.map(
              (word: ClosingHeadlineWord, index: number) => {
                if (word.kind === "text") {
                  return <span key={index}>{word.value}</span>;
                }
                if (word.kind === "break") {
                  return <br key={index} />;
                }
                return (
                  <HighlightWord key={index} variant={word.variant}>
                    {word.value}
                  </HighlightWord>
                );
              },
            )}
          </h2>
          {CLOSING_COPY.body.map((paragraph, index) => (
            <p
              key={index}
              className="mx-auto mt-5 max-w-prose text-base leading-relaxed text-white/80 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={CLOSING_COPY.ctaPrimary.href}
              className={buttonVariants({
                variant: "primary",
                size: "lg",
              })}
            >
              {CLOSING_COPY.ctaPrimary.label}
            </Link>
            <Link
              href={CLOSING_COPY.ctaSecondary.href}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-white/40 text-white hover:bg-white/10",
              })}
            >
              {CLOSING_COPY.ctaSecondary.label}
            </Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-wider text-white/55">
            Scroll lagi sedikit untuk membuka sumber &amp; catatan ↓
          </p>
        </div>
      </div>
    </div>
  );
}

function ReducedMotionClosing() {
  return (
    <>
      <section
        id="act-11"
        aria-labelledby="act-11-eyebrow"
        className="full-bleed relative isolate overflow-hidden bg-edu-night text-white"
      >
        {/* No top gradient bridge — ACT 10's bottom vignette ends in
            `edu-night` so ACT 11 starts solid dark for a seamless join.
            Bottom keeps fading to background because the FootnoteList that
            follows (in reduced-motion fallback) is light. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-edu-night to-background"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(var(--color-primary)/0.35),transparent_55%)]"
        />
        <div className="container mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <p id="act-11-eyebrow" className="eyebrow text-white/70">
            {CLOSING_COPY.eyebrow}
          </p>
          <FadeInView as="div" className="mt-8">
            <h2 className="section-headline text-balance text-white">
              {CLOSING_COPY.headline.map(
                (word: ClosingHeadlineWord, index: number) => {
                  if (word.kind === "text") {
                    return <span key={index}>{word.value}</span>;
                  }
                  if (word.kind === "break") {
                    return <br key={index} />;
                  }
                  return (
                    <HighlightWord key={index} variant={word.variant}>
                      {word.value}
                    </HighlightWord>
                  );
                },
              )}
            </h2>
            {CLOSING_COPY.body.map((paragraph, index) => (
              <p
                key={index}
                className="mx-auto mt-6 max-w-prose text-lg leading-relaxed text-white/80"
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={CLOSING_COPY.ctaPrimary.href}
                className={buttonVariants({
                  variant: "primary",
                  size: "lg",
                })}
              >
                {CLOSING_COPY.ctaPrimary.label}
              </Link>
              <Link
                href={CLOSING_COPY.ctaSecondary.href}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/40 text-white hover:bg-white/10",
                })}
              >
                {CLOSING_COPY.ctaSecondary.label}
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>
      <FootnoteList />
    </>
  );
}
