"use client";

// ACT 5 — 1.000 HPK pinned scroll. The container reserves 6× viewport
// height; as the user scrolls, `scrollYProgress` maps to a day count
// 0–1000 which selects the active frame from `TIMELINE_FRAMES`. The
// hero illustration + side panel cross-fade per frame; the progress
// rail at the bottom shows the active band.
//
// Reduced-motion users get a static vertical list with all six frames
// stacked — no pinned scroll, no morph.

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

import { TIMELINE_COPY } from "@/config/edukasi";
import {
  TIMELINE_FRAMES,
  TIMELINE_TOTAL_DAYS,
  resolveTimelineFrame,
  type TimelineFrame,
} from "@/data/edukasi/timeline";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";
import { PinnedSection, usePinnedProgress } from "../primitives/pinned-section";

import { TimelineIllustration } from "./timeline-illustration";

function TimelinePanel({ frame }: { readonly frame: TimelineFrame }) {
  return (
    <motion.aside
      key={frame.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      // Fixed `min-h` keeps the panel the same height every frame so the
      // illustration column to the left of it doesn't bounce up and down
      // during scroll-driven frame swaps. Content shorter than min-h
      // leaves whitespace at the bottom; longer content overflows
      // gracefully without forcing a layout shift on neighbouring frames.
      className="flex min-h-[26rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:min-h-[28rem] sm:p-7"
    >
      <p className="eyebrow">{frame.railLabel}</p>
      <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
        {frame.title}
      </h3>
      <p className="mt-3 text-sm font-medium uppercase tracking-wider text-primary">
        {frame.sizeAnalogy}
      </p>
      <p className="mt-4 text-base leading-relaxed text-foreground/85">
        {frame.body}
      </p>
      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {TIMELINE_COPY.actionsTitle}
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/85">
        {frame.actions.map((action) => (
          <li key={action} className="grid grid-cols-[1rem_1fr] gap-2">
            <span aria-hidden="true" className="text-primary">
              •
            </span>
            <span>{action}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs text-muted-foreground">{frame.sourceLabel}</p>
    </motion.aside>
  );
}

function ReducedMotionTimeline() {
  return (
    <ActSection id="act-5" eyebrow={TIMELINE_COPY.eyebrow} maxWidth="wide">
      <FadeInView as="div" className="max-w-prose">
        <h2 className="section-headline text-balance text-foreground">
          <span>{TIMELINE_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={TIMELINE_COPY.headlineHighlight.variant}>
            {TIMELINE_COPY.headlineHighlight.value}
          </HighlightWord>{" "}
          <span>{TIMELINE_COPY.headlineTail}</span>
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          {TIMELINE_COPY.helper}
        </p>
        <aside className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">
            {TIMELINE_COPY.reduceMotionFallbackTitle}
          </p>
          <p className="mt-1">{TIMELINE_COPY.reduceMotionFallbackBody}</p>
        </aside>
      </FadeInView>

      <ol className="mt-12 space-y-6">
        {TIMELINE_FRAMES.map((frame) => (
          <li
            key={frame.id}
            className="grid items-start gap-6 sm:grid-cols-[1fr_2fr]"
          >
            <div className="relative aspect-square w-full max-w-xs">
              <TimelineIllustration frame={frame} />
            </div>
            <TimelinePanel frame={frame} />
          </li>
        ))}
      </ol>
    </ActSection>
  );
}

function TimelineInner() {
  const progress = usePinnedProgress();
  const day = useTransform(progress, (latest) =>
    Math.round(latest * TIMELINE_TOTAL_DAYS),
  );
  const railWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

  const fallbackFrame = TIMELINE_FRAMES[0];
  const [activeFrameId, setActiveFrameId] = useState<string>(
    fallbackFrame?.id ?? "",
  );

  useMotionValueEvent(day, "change", (latest) => {
    const frame = resolveTimelineFrame(latest);
    if (frame.id !== activeFrameId) {
      setActiveFrameId(frame.id);
    }
  });

  const activeFrame = useMemo(() => {
    const match = TIMELINE_FRAMES.find((f) => f.id === activeFrameId);
    return match ?? fallbackFrame;
  }, [activeFrameId, fallbackFrame]);

  if (!activeFrame) return null;

  return (
    <div className="container relative mx-auto w-full max-w-6xl px-4 sm:px-6">
      <header className="mb-6 max-w-3xl">
        <p className="eyebrow">{TIMELINE_COPY.eyebrow}</p>
        <h2 className="section-headline mt-3 text-balance text-foreground">
          <span>{TIMELINE_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={TIMELINE_COPY.headlineHighlight.variant}>
            {TIMELINE_COPY.headlineHighlight.value}
          </HighlightWord>{" "}
          <span>{TIMELINE_COPY.headlineTail}</span>
        </h2>
      </header>

      <div className="grid items-center gap-8 lg:grid-cols-[5fr_4fr] lg:gap-12">
        <div className="relative aspect-square w-full max-w-md justify-self-center">
          <AnimatePresence mode="wait" initial={false}>
            <TimelineIllustration frame={activeFrame} />
          </AnimatePresence>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <TimelinePanel frame={activeFrame} />
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 rounded-full border border-border bg-surface/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-baseline gap-3">
          <span className="text-xs uppercase tracking-wider text-foreground/70">
            {TIMELINE_COPY.dayLabel}
          </span>
          <motion.span className="text-2xl font-bold tabular-nums tracking-tight text-primary">
            {day}
          </motion.span>
          <span className="text-xs uppercase tracking-wider text-foreground/70">
            {TIMELINE_COPY.ofTotalLabel}
          </span>
        </div>
        <div
          className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: railWidth }}
          />
          <div className="pointer-events-none absolute inset-0">
            {TIMELINE_FRAMES.map((frame) => {
              const leftPct = (frame.startDay / TIMELINE_TOTAL_DAYS) * 100;
              return (
                <span
                  key={`marker-${frame.id}`}
                  aria-hidden="true"
                  className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-foreground/20"
                  style={{ left: `${leftPct}%` }}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-foreground/70">
          {TIMELINE_FRAMES.map((frame) => (
            <span key={`rail-${frame.id}`}>{frame.railLabel}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimelineSection() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <ReducedMotionTimeline />;

  return (
    <PinnedSection
      id="act-5"
      framesCount={TIMELINE_FRAMES.length}
      tone="default"
      ariaLabel="Lini masa 1.000 Hari Pertama Kehidupan"
    >
      <TimelineInner />
    </PinnedSection>
  );
}
