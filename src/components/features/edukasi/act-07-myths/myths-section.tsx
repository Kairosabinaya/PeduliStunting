import { MYTHS_COPY } from "@/config/edukasi";
import { EDUKASI_MYTHS } from "@/data/edukasi/myths";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";
import { MythCard } from "./myth-card";

/**
 * ACT 7 — Mitos vs Fakta. Server shell that lists ten flip cards (the
 * cards themselves are client components for the flip interaction). The
 * background uses the `bg-edu-tint-cream` token so this section reads
 * visually distinct from neighbouring ACTs without breaking dark mode
 * (the dark theme automatically maps cream to a deep warm grey).
 */
export function MythsSection() {
  return (
    <ActSection id="act-7" eyebrow={MYTHS_COPY.eyebrow} cream maxWidth="wide">
      <FadeInView as="div" className="max-w-prose">
        <h2 className="section-headline text-balance text-foreground">
          <span>{MYTHS_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={MYTHS_COPY.headlineHighlights[0].variant}>
            {MYTHS_COPY.headlineHighlights[0].value}
          </HighlightWord>{" "}
          <span>{MYTHS_COPY.headlineMid}</span>{" "}
          <HighlightWord variant={MYTHS_COPY.headlineHighlights[1].variant}>
            {MYTHS_COPY.headlineHighlights[1].value}
          </HighlightWord>
          <span>{MYTHS_COPY.headlineTail}</span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {MYTHS_COPY.helperText}
        </p>
      </FadeInView>

      <div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2">
        {EDUKASI_MYTHS.map((card, index) => (
          <FadeInView
            key={card.id}
            as="div"
            offsetPx={12}
            delayMs={index * 80}
            className="h-full"
          >
            <MythCard card={card} />
          </FadeInView>
        ))}
      </div>
    </ActSection>
  );
}
