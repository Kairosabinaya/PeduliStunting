"use client";

// Client component because the flip relies on `useState`, a scroll listener,
// and motion's per-axis rotate transforms.

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { MYTHS_COPY } from "@/config/edukasi";
import type { MythCardData } from "@/data/edukasi/myths";

const FLIP_DURATION_SEC = 0.55;
const FLIP_EASE = [0.65, 0, 0.35, 1] as const;

export interface MythCardProps {
  readonly card: MythCardData;
}

/**
 * Flip card showing a myth on the front and the corrective fact on the back.
 * It flips automatically as the reader scrolls: when the card's vertical
 * centre crosses the middle of the viewport it turns to the fact, and turns
 * back to the myth when scrolled above that line again — so scrolling the
 * section reveals myth then fact for every card, and scrolling back up lets
 * the reader re-read either side. A manual click still toggles the card
 * (handy for revisiting a face); the next scroll crossing re-syncs it.
 *
 * Implemented as a `<button>` (not a `<div>` with `role="button"`) so it
 * comes with native Enter/Space handling and focus management out of the
 * box, satisfying project guidelines §20 "Semantic HTML before ARIA".
 *
 * Reduced-motion users get the legacy click-only behaviour with an instant
 * swap instead of the scroll-driven 3D flip.
 */
export function MythCard({ card }: MythCardProps) {
  const [showFact, setShowFact] = useState(false);
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Scroll-driven flip. We mirror the native-scroll-listener pattern used by
  // ACT 2 (see `stakes-section.tsx`) rather than motion's `useScroll`, which
  // proved unreliable under the page's Lenis smooth-scroll. We only write
  // state when the card crosses the viewport centre (a threshold change), so
  // a manual click stays put until the reader scrolls across that line again.
  const lastScrollFactRef = useRef(false);
  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === "undefined") return;
    let rafId = 0;
    let pending = false;
    const compute = () => {
      pending = false;
      const node = buttonRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      // Skip until the card has a measurable box (avoids a spurious flip on
      // mount before layout, and in zero-size test environments).
      if (rect.height === 0) return;
      const cardCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const scrollFact = cardCenter <= viewportCenter;
      if (scrollFact !== lastScrollFactRef.current) {
        lastScrollFactRef.current = scrollFact;
        setShowFact(scrollFact);
      }
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      cancelAnimationFrame(rafId);
    };
  }, [reduceMotion]);

  const toggle = () => setShowFact((prev) => !prev);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-pressed={showFact}
      aria-label={`${showFact ? MYTHS_COPY.hideFactCta : MYTHS_COPY.showFactCta} — ${card.mythText}`}
      className="group relative block h-full w-full cursor-pointer select-text rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-edu-tint-cream"
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative h-full min-h-[18rem] w-full"
        animate={{ rotateY: showFact ? 180 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: FLIP_DURATION_SEC, ease: FLIP_EASE }
        }
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front — Mitos */}
        <div
          id={`${baseId}-myth`}
          className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-edu-flag/30 bg-surface p-6 shadow-sm"
          style={{ backfaceVisibility: "hidden" }}
          aria-hidden={showFact}
        >
          <div>
            <span className="inline-flex items-center rounded-full bg-edu-flag/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-edu-flag">
              {MYTHS_COPY.mythBadge}
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug text-foreground">
              “{card.mythText}”
            </p>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-edu-flag">
            <span>{MYTHS_COPY.showFactCta}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </p>
        </div>
        {/* Back — Fakta */}
        <div
          id={`${baseId}-fact`}
          className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-accent/40 bg-accent/10 p-6 shadow-sm"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          aria-hidden={!showFact}
        >
          <div>
            {/* Solid accent fill: a translucent `bg-accent/20` collapsed to
                dark-green-on-dark-green in dark mode. The solid `accent` /
                `accent-foreground` pair clears AA in both themes. */}
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              {MYTHS_COPY.factBadge}
            </span>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              {card.factText}
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {MYTHS_COPY.sourceLabel}:{" "}
              <span className="font-medium normal-case text-foreground/85">
                {card.sourceLabel}
              </span>
            </p>
            <p className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70">
              <span aria-hidden="true">↺</span>
              <span>{MYTHS_COPY.backFaceHint}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </button>
  );
}
