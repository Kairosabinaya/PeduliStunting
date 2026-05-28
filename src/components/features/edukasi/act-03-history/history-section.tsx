import { HISTORY_COPY } from "@/config/edukasi";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";
import { StuntingLineChart } from "./stunting-line-chart";

// `StuntingLineChart` is a `"use client"` component that Next.js code-splits
// automatically when imported from this Server Component. We deliberately
// avoid `next/dynamic` with `ssr: false`: in the App Router that disables
// server-rendering of the whole subtree even when wrapped here, and the
// skeleton placeholder is barely visible because of how fast hydration
// runs in practice. Recharts handles SSR via `ResponsiveContainer` which
// is dimension-aware on the client.

/**
 * ACT 3 — Indonesia's stunting journey. Two-column layout (text + chart on
 * lg+, stacked below). Uses the structured `HISTORY_COPY` so copy edits do
 * not touch this file. Chart is lazy-loaded to keep the route under the
 * bundle budget for above-the-fold ACTs.
 */
export function HistorySection() {
  return (
    <ActSection
      id="act-3"
      eyebrow={HISTORY_COPY.eyebrow}
      maxWidth="wide"
      // Slimmer vertical rhythm than the default ActSection padding
      // because the chart already provides strong vertical weight; the
      // section was otherwise leaving ~280px of empty space below the
      // closing copy at 1440×900.
      className="bg-background !py-16 sm:!py-20 lg:!py-24"
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
