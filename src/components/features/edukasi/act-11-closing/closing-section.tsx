import Link from "next/link";

import { CLOSING_COPY, type ClosingHeadlineWord } from "@/config/edukasi";
import { buttonVariants } from "@/components/primitives/button";

import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";

/**
 * ACT 11 — closing band. Renders the structured `CLOSING_COPY.headline`
 * (text + break + white highlight tokens) so copy edits stay in config.
 * Two CTAs lead readers either to the national map (ACT 10 substitute in
 * Phase 1) or to the personal tracker — keeping the experience open-ended
 * instead of dead-ending at the bottom of the page.
 */
export function ClosingSection() {
  return (
    <section
      id="act-11"
      aria-labelledby="act-11-eyebrow"
      className="full-bleed relative isolate overflow-hidden bg-edu-night text-white"
    >
      {/* Two-sided gradient bridge — mirrors the pattern used by
          ActSection's `dark` variant. The strip overlays the solid dark
          bg so `from-background` (light) at the edge actually shows the
          body-bg colour, fading into solid dark over 80px. Mirrored at
          the bottom to soften the transition into the light FootnoteList. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-edu-night"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-edu-night to-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(var(--color-primary)/0.35),transparent_55%)]"
      />
      <div className="container mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <p id="act-11-eyebrow" className="eyebrow text-white/70">
          {CLOSING_COPY.eyebrow}
        </p>
        <FadeInView as="div" className="mt-8">
          <h2 className="section-headline text-balance text-white">
            {CLOSING_COPY.headline.map(
              (word: ClosingHeadlineWord, index: number) => {
                if (word.kind === "text") {
                  return <span key={index}>{word.value}</span>;
                }
                if (word.kind === "break") {
                  return <br key={index} />;
                }
                return (
                  <HighlightWord key={index} variant={word.variant}>
                    {word.value}
                  </HighlightWord>
                );
              },
            )}
          </h2>
          {CLOSING_COPY.body.map((paragraph, index) => (
            <p
              key={index}
              className="mx-auto mt-6 max-w-prose text-lg leading-relaxed text-white/80"
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={CLOSING_COPY.ctaPrimary.href}
              className={buttonVariants({
                variant: "primary",
                size: "lg",
              })}
            >
              {CLOSING_COPY.ctaPrimary.label}
            </Link>
            <Link
              href={CLOSING_COPY.ctaSecondary.href}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-white/40 text-white hover:bg-white/10",
              })}
            >
              {CLOSING_COPY.ctaSecondary.label}
            </Link>
          </div>
        </FadeInView>

        <div className="mt-16 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-8 text-xs text-white/55 sm:flex-row">
          <span>{CLOSING_COPY.metaCopyright}</span>
          <span>{CLOSING_COPY.metaSources}</span>
          <span>{CLOSING_COPY.metaIndependent}</span>
        </div>
      </div>
    </section>
  );
}
