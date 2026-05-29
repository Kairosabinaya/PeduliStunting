"use client";

/**
 * ACT 4 — Interactive WHO determinant framework. Refactored into a
 * `PinnedSection` (framesCount=10) so the section now spotlights one ring
 * at a time (L5 → L1, scrolling outward → inward, mirroring how stunting
 * causation flows from distal to proximal factors), then sweeps Q1 → Q5
 * across the quintile chart.
 *
 * Scroll progress mapping:
 *   - 0.00 → 0.45  : ring sweep (5 rings × 0.09 progress segments,
 *                    rounded — L5 → L1)
 *   - 0.45 → 0.50  : crossover frame (rings + quintile both visible,
 *                    panel content transitions)
 *   - 0.50 → 1.00  : quintile sweep (5 bars × 0.10 progress segments,
 *                    Q1 → Q5)
 *
 * Reduced-motion users get the legacy click-based layout with rings,
 * panel, button selector, and quintile chart all visible at once. The
 * `useReducedMotion` hook is hydration-safe.
 */

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

import { Button } from "@/components/primitives/button";
import { DETERMINANT_COPY } from "@/config/edukasi";
import {
  DETERMINANT_LAYERS,
  INCOME_QUINTILES,
  type DeterminantLayer,
} from "@/data/edukasi/determinants";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";
import { PinnedSection, usePinnedProgress } from "../primitives/pinned-section";

import { ConcentricRings } from "./concentric-rings";
import { QuintileChart } from "./quintile-chart";

const PANEL_TONE_CLASS: Record<DeterminantLayer["tone"], string> = {
  primary: "border-primary/40 bg-primary/5",
  secondary: "border-primary-soft/50 bg-primary-soft/8",
  success: "border-accent/50 bg-accent/8",
  warm: "border-edu-warm/55 bg-edu-warm/12",
  danger: "border-edu-flag/50 bg-edu-flag/8",
};

// Layers sorted L5 → L1 so scroll-driven sweep matches user expectation
// "L5 ke L4 ke L3 ke L2 ke L1".
const LAYERS_OUTER_TO_INNER = [...DETERMINANT_LAYERS].sort(
  (a, b) => b.level - a.level,
);

const RING_SWEEP_END = 0.45;
const QUINTILE_SWEEP_START = 0.55;

function DeterminantInner() {
  const progress = usePinnedProgress();

  // Map [0, RING_SWEEP_END] → ring index 0..4 (outer to inner).
  const ringIndex = useTransform(progress, (latest) => {
    if (latest >= RING_SWEEP_END) return LAYERS_OUTER_TO_INNER.length - 1;
    const idx = Math.floor(
      (latest / RING_SWEEP_END) * LAYERS_OUTER_TO_INNER.length,
    );
    return Math.min(idx, LAYERS_OUTER_TO_INNER.length - 1);
  });

  // Map [QUINTILE_SWEEP_START, 1] → quintile index 0..4 (Q1 to Q5).
  const quintileIndex = useTransform(progress, (latest) => {
    if (latest < QUINTILE_SWEEP_START) return -1;
    const adjusted =
      (latest - QUINTILE_SWEEP_START) / (1 - QUINTILE_SWEEP_START);
    const idx = Math.floor(adjusted * INCOME_QUINTILES.length);
    return Math.min(idx, INCOME_QUINTILES.length - 1);
  });

  const fallbackLayer = LAYERS_OUTER_TO_INNER[0];
  const fallbackQuintile = INCOME_QUINTILES[0];

  const [activeLayer, setActiveLayer] = useState<DeterminantLayer | undefined>(
    fallbackLayer,
  );
  const [activeQuintileIdx, setActiveQuintileIdx] = useState<number>(-1);

  useMotionValueEvent(ringIndex, "change", (idx) => {
    const layer = LAYERS_OUTER_TO_INNER[idx];
    if (layer && layer.id !== activeLayer?.id) {
      setActiveLayer(layer);
    }
  });
  useMotionValueEvent(quintileIndex, "change", (idx) => {
    if (idx !== activeQuintileIdx) setActiveQuintileIdx(idx);
  });

  const activeLevel = activeLayer?.level ?? null;
  const activeQuintile =
    activeQuintileIdx >= 0 ? INCOME_QUINTILES[activeQuintileIdx] : null;

  const showRings = activeQuintileIdx < 0;
  const showQuintile = activeQuintileIdx >= 0;

  if (!fallbackLayer || !fallbackQuintile) return null;
  const displayLayer = activeLayer ?? fallbackLayer;

  return (
    <div className="container relative mx-auto w-full max-w-6xl px-4 sm:px-6">
      <header className="mb-6 max-w-3xl">
        <p className="eyebrow">{DETERMINANT_COPY.eyebrow}</p>
        <h2 className="section-headline mt-3 text-balance text-foreground">
          <span>{DETERMINANT_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={DETERMINANT_COPY.headlineHighlight.variant}>
            {DETERMINANT_COPY.headlineHighlight.value}
          </HighlightWord>
          .
        </h2>
      </header>

      <div className="relative grid items-center gap-8 lg:grid-cols-[5fr_4fr] lg:gap-12">
        {/* Rings + active panel (visible during the ring sweep) */}
        <AnimatePresence mode="wait">
          {showRings ? (
            <motion.div
              key="rings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square w-full max-w-md justify-self-center"
            >
              <ConcentricRings activeLevel={activeLevel} />
            </motion.div>
          ) : null}
          {showQuintile ? (
            <motion.div
              key="quintile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuintileChart activeIndex={activeQuintileIdx} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Side panel — switches between layer detail and quintile detail */}
        <div>
          <AnimatePresence mode="wait" initial={false}>
            {showRings ? (
              <motion.article
                key={`layer-${displayLayer.id}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className={`flex min-h-[20rem] flex-col rounded-2xl border p-6 sm:p-7 ${PANEL_TONE_CLASS[displayLayer.tone]}`}
              >
                <p className="eyebrow">Lapisan {displayLayer.level}</p>
                <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  {displayLayer.label}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-foreground/85">
                  {displayLayer.description}
                </p>
                <aside className="mt-6 rounded-xl border border-border bg-surface p-4 shadow-xs">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {DETERMINANT_COPY.evidenceLabel} ·{" "}
                    {displayLayer.evidenceTitle}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    <span>{displayLayer.evidenceBody}</span>
                    {displayLayer.evidenceFootnoteId ? (
                      <FootnoteRef id={displayLayer.evidenceFootnoteId} />
                    ) : null}
                  </p>
                </aside>
              </motion.article>
            ) : null}
            {showQuintile && activeQuintile ? (
              <motion.article
                key={`quintile-${activeQuintile.id}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-[20rem] flex-col rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-7"
              >
                <p className="eyebrow">{activeQuintile.label}</p>
                <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  {activeQuintile.prevalencePct.toLocaleString("id-ID", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  % prevalensi stunting
                </h3>
                <p className="mt-4 text-base leading-relaxed text-foreground/85">
                  {activeQuintile.note}
                </p>
              </motion.article>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Reduced-motion fallback: classic click-driven layout with rings, panel,
 * button selector, and quintile chart all visible at once. No PinnedSection.
 */
function ReducedMotionDeterminant() {
  const firstLayer = DETERMINANT_LAYERS[0];
  const [activeId, setActiveId] = useState<string | null>(
    firstLayer?.id ?? null,
  );
  const activeLayer = useMemo(
    () => DETERMINANT_LAYERS.find((l) => l.id === activeId) ?? firstLayer,
    [activeId, firstLayer],
  );
  if (!activeLayer) return null;

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

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[5fr_4fr] lg:gap-16">
        <div>
          <div className="mx-auto aspect-square w-full max-w-md">
            <ConcentricRings activeId={activeId} onSelect={setActiveId} />
          </div>
          <fieldset
            className="mt-4 flex flex-wrap justify-center gap-2"
            aria-label={DETERMINANT_COPY.layerSelectLabel}
          >
            <legend className="sr-only">
              {DETERMINANT_COPY.layerSelectLabel}
            </legend>
            {DETERMINANT_LAYERS.map((layer) => {
              const active = activeId === layer.id;
              return (
                <Button
                  key={layer.id}
                  size="sm"
                  variant={active ? "primary" : "secondary"}
                  onClick={() => setActiveId(layer.id)}
                  aria-pressed={active}
                >
                  L{layer.level} · {layer.label.split(" ")[0]}
                </Button>
              );
            })}
          </fieldset>
        </div>

        <div>
          <article
            className={`rounded-2xl border p-6 sm:p-7 ${PANEL_TONE_CLASS[activeLayer.tone]}`}
          >
            <p className="eyebrow">Lapisan {activeLayer.level}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              {activeLayer.label}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-foreground/85">
              {activeLayer.description}
            </p>
            <aside className="mt-6 rounded-xl border border-border bg-surface p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {DETERMINANT_COPY.evidenceLabel} · {activeLayer.evidenceTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                <span>{activeLayer.evidenceBody}</span>
                {activeLayer.evidenceFootnoteId ? (
                  <FootnoteRef id={activeLayer.evidenceFootnoteId} />
                ) : null}
              </p>
            </aside>
          </article>
        </div>
      </div>

      <div className="mt-16">
        <FadeInView as="div">
          <QuintileChart />
        </FadeInView>
      </div>
    </ActSection>
  );
}

export function DeterminantSection() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <ReducedMotionDeterminant />;
  return (
    <PinnedSection
      id="act-4"
      framesCount={10}
      tone="default"
      ariaLabel="Lapisan determinant stunting WHO dan disparitas berdasarkan kelompok ekonomi"
    >
      <DeterminantInner />
    </PinnedSection>
  );
}
