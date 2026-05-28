"use client";

// ACT 2 — Pinned 3-frame "kenapa 1.000 hari?".
//
// History: prior implementations using motion's `useScroll` (both via
// `PinnedSection`'s Context and directly) left the section's progress
// MotionValue stuck at 0 in browser testing — Frame 1 stayed at
// `opacity: 1` forever, Frames 2 and 3 never appeared. This was likely
// a Lenis-vs-motion event subscription mismatch; the rest of the page
// (ACT 5 timeline) used the same pattern and worked, but ACT 2 sits
// earlier in the document and may hit a mount-order race.
//
// This implementation bypasses `useScroll` entirely. A native `scroll`
// listener computes section progress from `getBoundingClientRect`, then
// writes the result into a `useMotionValue` so the downstream
// `useTransform` chain still benefits from motion's render-free updates.
// `requestAnimationFrame` throttles the listener so scroll doesn't fire
// per-pixel on Lenis's animated wheel-deceleration.

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";

import { STAKES_COPY, BRAIN_DEVELOPMENT_TILES } from "@/config/edukasi";

import { AnimatedCounter } from "../primitives/animated-counter";
import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";
import { StatTile } from "../primitives/stat-tile";

import { SynapseCanvas } from "./synapse-canvas";

const FRAMES_COUNT = 3;

export function StakesSection() {
  const trackRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId = 0;
    let pending = false;

    const compute = () => {
      pending = false;
      const node = trackRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // Range we map across: from `section.top = 0` (start pin) to
      // `section.bottom = vh` (end pin). Total scroll length =
      // `rect.height - vh`. Outside this range we clamp to 0 / 1 so the
      // motion values don't go out of bounds.
      const scrollRange = rect.height - vh;
      if (scrollRange <= 0) {
        progress.set(0);
        return;
      }
      const scrolled = -rect.top;
      const next = Math.max(0, Math.min(1, scrolled / scrollRange));
      progress.set(next);
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(compute);
    };

    // Initial measurement once the layout has settled.
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      cancelAnimationFrame(rafId);
    };
  }, [progress]);

  // Input ranges shifted ~0.1 earlier per R4 review: previous mapping
  // made Frame 2 ("700–1.000") peak too late (scrollY ~2000); design
  // intent is for F2 to peak around mid-section (~scrollY 1500) and
  // hand off to F3 by ~scrollY 2500.
  const introOpacity = useTransform(
    progress,
    [0, 0.05, 0.2, 0.3],
    [1, 1, 0.6, 0],
  );
  const introY = useTransform(progress, [0, 0.3], [0, -20]);

  const rateOpacity = useTransform(
    progress,
    [0.15, 0.3, 0.55, 0.7],
    [0, 1, 1, 0],
  );
  const rateY = useTransform(progress, [0.2, 0.35], [16, 0]);

  const cardsOpacity = useTransform(progress, [0.6, 0.75, 1], [0, 1, 1]);
  const cardsY = useTransform(progress, [0.55, 0.7], [24, 0]);

  const synapseOpacity = useTransform(progress, [0, 0.15], [0.45, 1]);

  // Gate counters until their owning frame is actually visible. Without
  // this the count-up runs the moment the pinned section enters the
  // viewport (before the user can even see Frame 2 or 3), so the
  // "wow" moment of watching the number tally up is lost.
  const [rateActive, setRateActive] = useState(false);
  const [cardsActive, setCardsActive] = useState(false);
  useMotionValueEvent(rateOpacity, "change", (latest) => {
    setRateActive((prev) => prev || latest > 0.3);
  });
  useMotionValueEvent(cardsOpacity, "change", (latest) => {
    setCardsActive((prev) => prev || latest > 0.3);
  });

  return (
    <section
      ref={trackRef}
      id="act-2"
      aria-label="Mengapa 1.000 hari pertama menentukan masa depan anak"
      className="full-bleed relative bg-background text-foreground"
      style={{ height: `${FRAMES_COUNT * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ opacity: synapseOpacity }}
        >
          <SynapseCanvas ariaLabel="Animasi titik dan garis menggambarkan koneksi saraf yang terbentuk di otak bayi." />
        </motion.div>

        <p className="eyebrow absolute inset-x-0 top-24 z-elevated text-center">
          {STAKES_COPY.eyebrow}
        </p>

        {/* Frame 1 — intro headline */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        >
          <h2 className="section-headline max-w-3xl text-balance text-foreground">
            {STAKES_COPY.frameIntro.title}
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-muted-foreground sm:text-lg">
            {STAKES_COPY.frameIntro.helper}
          </p>
        </motion.div>

        {/* Frame 2 — synapse rate counter */}
        <motion.div
          style={{ opacity: rateOpacity, y: rateY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        >
          <p className="text-balance text-7xl font-extrabold leading-none tracking-tighter text-primary sm:text-8xl md:text-9xl">
            <AnimatedCounter
              value={STAKES_COPY.frameRate.rangeMin}
              className="inline-block"
              enabled={rateActive}
            />
            <span aria-hidden="true" className="mx-2">
              –
            </span>
            <AnimatedCounter
              value={STAKES_COPY.frameRate.rangeMax}
              className="inline-block"
              enabled={rateActive}
            />
          </p>
          <p className="mt-3 text-base font-medium uppercase tracking-wider text-muted-foreground sm:text-lg">
            {STAKES_COPY.frameRate.label}
            <FootnoteRef id={STAKES_COPY.frameRate.footnoteId} />
          </p>
          <p className="mx-auto mt-6 max-w-prose text-balance text-base leading-relaxed text-foreground/85 sm:text-lg">
            {STAKES_COPY.frameRate.body}
          </p>
        </motion.div>

        {/* Frame 3 — brain development tiles */}
        <motion.div
          style={{ opacity: cardsOpacity, y: cardsY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-4"
        >
          <p className="mb-8 max-w-2xl text-balance text-center text-xl font-semibold text-foreground sm:text-2xl">
            <span>{STAKES_COPY.frameImplication.headline}</span>{" "}
            <HighlightWord variant="primary">
              {STAKES_COPY.frameImplication.tail}
            </HighlightWord>
            <FootnoteRef id={STAKES_COPY.frameImplication.footnoteId} />
          </p>
          <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            {BRAIN_DEVELOPMENT_TILES.map((tile) => (
              <StatTile
                key={tile.caption}
                value={
                  <AnimatedCounter
                    value={tile.value}
                    suffix={tile.suffix}
                    className="inline-block"
                    enabled={cardsActive}
                  />
                }
                caption={tile.caption}
                helper={tile.helper}
                tone={tile.tone}
              />
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-balance text-center text-base leading-relaxed text-muted-foreground">
            {STAKES_COPY.frameImplication.closing}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
