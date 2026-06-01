import { QUIZ_COPY } from "@/config/edukasi";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";
import { QuizWidget } from "./quiz-widget";

// `QuizWidget` is a client component; Next.js automatically code-splits
// the chunk when imported from this Server Component. We avoid
// `next/dynamic({ ssr: false })` because in the App Router that pattern
// must originate from another client component, and the quiz UI is small
// enough that the initial HTML render is preferable for SEO + first paint.

/**
 * ACT 9 — interactive quiz. Dark band visual, dominated by the
 * `QuizWidget` client component. The shell delivers the centered heading;
 * the widget owns its own intro / question / result orchestration. The
 * question card sits below the heading and swaps its body between the
 * prompt and the result as the user answers, so it never reserves an empty
 * region.
 *
 * `bridgeBottom={false}` so ACT 9's dark band runs flush into ACT 10's
 * top vignette (also dark) — see `ActSection` docstring for the rationale.
 */
export function QuizSection() {
  return (
    <ActSection
      id="act-9"
      eyebrow={QUIZ_COPY.eyebrow}
      dark
      maxWidth="narrow"
      bridgeBottom={false}
    >
      <div className="relative mx-auto flex w-full flex-col items-center">
        <FadeInView as="div" className="w-full">
          <h2 className="display-headline text-balance text-center text-white">
            <span>{QUIZ_COPY.headlineLead}</span>{" "}
            <HighlightWord variant={QUIZ_COPY.headlineHighlight.variant}>
              {QUIZ_COPY.headlineHighlight.value}
            </HighlightWord>{" "}
            <span>{QUIZ_COPY.headlineTail}</span>
          </h2>
        </FadeInView>
        <div className="mt-12 w-full">
          <QuizWidget />
        </div>
      </div>
    </ActSection>
  );
}
