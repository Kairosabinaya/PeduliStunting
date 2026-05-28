"use client";

// ACT 4 — Interactive WHO determinant framework. Five concentric rings;
// klik salah satu untuk membuka panel detail di sebelah kanan (atau
// stacked di bawah pada mobile). Plus quintile chart sebagai bukti
// kuantitatif untuk lapisan terluar (konteks sosial-ekonomi).

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/primitives/button";
import { DETERMINANT_COPY } from "@/config/edukasi";
import {
  DETERMINANT_LAYERS,
  type DeterminantLayer,
} from "@/data/edukasi/determinants";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";

import { ConcentricRings } from "./concentric-rings";
import { QuintileChart } from "./quintile-chart";

const PANEL_TONE_CLASS: Record<DeterminantLayer["tone"], string> = {
  primary: "border-primary/40 bg-primary/5",
  secondary: "border-primary-soft/50 bg-primary-soft/8",
  success: "border-accent/50 bg-accent/8",
  warm: "border-edu-warm/55 bg-edu-warm/12",
  danger: "border-edu-flag/50 bg-edu-flag/8",
};

export function DeterminantSection() {
  const firstLayer = DETERMINANT_LAYERS[0];
  const [activeId, setActiveId] = useState<string | null>(
    firstLayer?.id ?? null,
  );
  const reduceMotion = useReducedMotion();
  const activeLayer =
    DETERMINANT_LAYERS.find((l) => l.id === activeId) ?? firstLayer;
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
          <div
            className="mx-auto aspect-square w-full max-w-md"
            aria-hidden={false}
          >
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={activeLayer.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
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
            </motion.article>
          </AnimatePresence>
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
