import { GUIDE_COPY } from "@/config/edukasi";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";

import { AgeTabs } from "./age-tabs";

/**
 * ACT 6 — Panduan praktis per usia. Server shell + client AgeTabs.
 */
export function GuideSection() {
  return (
    <ActSection id="act-6" eyebrow={GUIDE_COPY.eyebrow} maxWidth="wide">
      <FadeInView as="div" className="max-w-prose">
        <h2 className="section-headline text-balance text-foreground">
          <span>{GUIDE_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={GUIDE_COPY.headlineHighlight.variant}>
            {GUIDE_COPY.headlineHighlight.value}
          </HighlightWord>
          <span>{GUIDE_COPY.headlineMid}</span>
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          {GUIDE_COPY.body}
        </p>
      </FadeInView>

      <div className="mt-12">
        <AgeTabs />
      </div>
    </ActSection>
  );
}
