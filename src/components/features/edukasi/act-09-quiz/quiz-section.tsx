import { QUIZ_COPY } from "@/config/edukasi";

import { ActSection } from "../primitives/act-section";
import { HighlightWord } from "../primitives/highlight-word";
import { QuizWidget } from "./quiz-widget";

// `QuizWidget` is a client component; Next.js automatically code-splits
// the chunk when imported from this Server Component. We avoid
// `next/dynamic({ ssr: false })` because in the App Router that pattern
// must originate from another client component, and the quiz UI is small
// enough that the initial HTML render is preferable for SEO + first paint.

/**
 * ACT 9 — interactive quiz. Dark band visual, dominated by the
 * `QuizWidget` client component. The shell delivers the headline + intro,
 * the widget handles all stateful behaviour.
 */
export function QuizSection() {
  return (
    <ActSection id="act-9" eyebrow={QUIZ_COPY.eyebrow} dark maxWidth="narrow">
      <h2 className="display-headline text-balance text-center text-white">
        <span>{QUIZ_COPY.headlineLead}</span>{" "}
        <HighlightWord variant={QUIZ_COPY.headlineHighlight.variant}>
          {QUIZ_COPY.headlineHighlight.value}
        </HighlightWord>{" "}
        <span>{QUIZ_COPY.headlineTail}</span>
      </h2>
      <div className="mt-12">
        <QuizWidget />
      </div>
    </ActSection>
  );
}
