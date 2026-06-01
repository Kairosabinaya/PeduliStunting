"use client";

/**
 * ACT 4 — WHO determinant framework as a scroll-jacked horizontal carousel.
 * A `PinnedSection` holds the viewport still while vertical scroll progress
 * (0 → 1) translates a horizontal track of five layer cards from L5 (distal
 * socio-economic context) to L1 (proximal child-level factors), mirroring how
 * stunting causation flows. Progress dots track position.
 *
 * Reduced-motion users get a normal section with the same cards in a native
 * horizontal swipe row (no scroll hijack). `useReducedMotion` is
 * hydration-safe.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

import { DETERMINANT_COPY } from "@/config/edukasi";
import { DETERMINANT_LAYERS } from "@/data/edukasi/determinants";
import { cn } from "@/lib/cn";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";
import { PinnedSection, usePinnedProgress } from "../primitives/pinned-section";
import { PointerTilt } from "../primitives/pointer-tilt";

import { DeterminantCard } from "./determinant-card";

// L5 → L1 so the sweep goes outer context inward to the child.
const LAYERS_OUTER_TO_INNER = [...DETERMINANT_LAYERS].sort(
  (a, b) => b.level - a.level,
);

// Pinned scroll length = CAROUSEL_FRAMES * 100vh. Tuned below the layer count
// (5) so the cards traverse with noticeably less scroll — a 1:1 mapping felt
// too slow to shift. ~300vh covers all five cards.
const CAROUSEL_FRAMES = 3;

function DeterminantHeader() {
  return (
    <FadeInView as="header" className="mb-8 max-w-3xl">
      <p className="eyebrow">{DETERMINANT_COPY.eyebrow}</p>
      <h2 className="section-headline mt-3 text-balance text-foreground">
        <span>{DETERMINANT_COPY.headlineLead}</span>{" "}
        <HighlightWord variant={DETERMINANT_COPY.headlineHighlight.variant}>
          {DETERMINANT_COPY.headlineHighlight.value}
        </HighlightWord>
        .
      </h2>
      <p className="mt-4 max-w-prose text-base text-muted-foreground sm:text-lg">
        <span>{DETERMINANT_COPY.body}</span>
        <FootnoteRef id={DETERMINANT_COPY.bodyFootnoteId} />
      </p>
    </FadeInView>
  );
}

function DeterminantInner() {
  const progress = usePinnedProgress();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [maxShift, setMaxShift] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure how far the track must slide so the last card ends flush with the
  // viewport's right edge. Recomputed on resize so the travel stays correct
  // across breakpoints / orientation changes.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const shift = track.scrollWidth - viewport.clientWidth;
      setMaxShift(shift > 0 ? shift : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const x = useTransform(progress, [0, 1], [0, -maxShift]);

  useMotionValueEvent(progress, "change", (latest) => {
    const last = LAYERS_OUTER_TO_INNER.length - 1;
    const idx = Math.min(Math.max(Math.round(latest * last), 0), last);
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  return (
    <div className="container relative mx-auto w-full max-w-6xl px-4 sm:px-6">
      <DeterminantHeader />

      <div ref={viewportRef} className="relative overflow-hidden">
        <motion.ul
          ref={trackRef}
          style={{ x }}
          className="flex gap-5 sm:gap-6"
          aria-label={DETERMINANT_COPY.layerSelectLabel}
        >
          {LAYERS_OUTER_TO_INNER.map((layer, index) => (
            <li
              key={layer.id}
              className="edu-determinant-card shrink-0 list-none"
            >
              <PointerTilt wrapperClassName="h-full" className="h-full">
                <DeterminantCard layer={layer} active={index === activeIndex} />
              </PointerTilt>
            </li>
          ))}
        </motion.ul>
      </div>

      <div
        className="mt-6 flex items-center justify-center gap-2"
        aria-hidden="true"
      >
        {LAYERS_OUTER_TO_INNER.map((layer, index) => (
          <span
            key={layer.id}
            className={cn(
              "h-2 rounded-full transition-all",
              index === activeIndex ? "w-6 bg-primary" : "w-2 bg-foreground/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Reduced-motion fallback: a normal section with the same cards in a native
 * horizontal swipe row — no scroll hijack.
 */
function ReducedMotionDeterminant() {
  return (
    <ActSection id="act-4" eyebrow={DETERMINANT_COPY.eyebrow} maxWidth="wide">
      <FadeInView as="div" className="max-w-prose">
        <h2 className="section-headline text-balance text-foreground">
          <span>{DETERMINANT_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={DETERMINANT_COPY.headlineHighlight.variant}>
            {DETERMINANT_COPY.headlineHighlight.value}
          </HighlightWord>
          .
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          <span>{DETERMINANT_COPY.body}</span>
          <FootnoteRef id={DETERMINANT_COPY.bodyFootnoteId} />
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {DETERMINANT_COPY.helper}
        </p>
      </FadeInView>

      <ul
        className="scrollbar-hide mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:gap-6"
        aria-label={DETERMINANT_COPY.layerSelectLabel}
      >
        {LAYERS_OUTER_TO_INNER.map((layer) => (
          <li
            key={layer.id}
            className="edu-determinant-card shrink-0 snap-start list-none"
          >
            <DeterminantCard layer={layer} />
          </li>
        ))}
      </ul>
    </ActSection>
  );
}

export function DeterminantSection() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <ReducedMotionDeterminant />;
  return (
    <PinnedSection
      id="act-4"
      framesCount={CAROUSEL_FRAMES}
      tone="default"
      ariaLabel="Lima lapisan determinant stunting menurut WHO"
    >
      <DeterminantInner />
    </PinnedSection>
  );
}
