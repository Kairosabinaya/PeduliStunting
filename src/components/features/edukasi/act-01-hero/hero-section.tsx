import { HERO_COPY } from "@/config/edukasi";

import { ScrollPrompt } from "../primitives/scroll-prompt";
import { HeroHeadline } from "./hero-headline";
import { HeroIllustration } from "./hero-illustration";
import { HeroLead } from "./hero-lead";

/**
 * ACT 1 — the hero cold-open. Server component shell that composes the
 * client headline (per-word reveal) with the static lead paragraph and
 * placeholder illustration.
 *
 * Layout:
 *  - Mobile / sub-md: stacked, illustration sits beneath the headline.
 *  - lg+: 2-column with the headline on the left and the illustration on
 *    the right. Background uses a soft warm tint via the `bg-edu-tint-warm`
 *    token to differentiate the hero from the rest of the page.
 *
 * The section is intentionally full-viewport on lg+ so the hero feels
 * cinematic, while mobile retains comfortable padding so users can reach
 * the scroll prompt thumb-friendly.
 */
export function HeroSection() {
  return (
    <section
      id="act-1"
      aria-labelledby="act-1-eyebrow"
      className="full-bleed relative isolate flex min-h-[80svh] flex-col justify-center overflow-hidden bg-edu-tint-warm pb-12 pt-24 sm:pt-28 lg:min-h-[88svh] lg:pt-32"
    >
      {/* Soft background gradient blob — purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%] bg-[radial-gradient(ellipse_at_top,rgb(var(--color-primary-soft)/0.18),transparent_60%)]"
      />
      {/* Exit gradient bridge — fades the warm hero tint into the body
          background as the user scrolls toward ACT 2. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-elevated h-20 bg-gradient-to-b from-edu-tint-warm/0 to-background"
      />

      <div className="container mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div>
          <p id="act-1-eyebrow" className="eyebrow mb-6">
            {HERO_COPY.eyebrow}
          </p>
          <HeroHeadline />
          <HeroLead />
          <p className="mt-10 max-w-prose text-sm text-muted-foreground">
            {HERO_COPY.factLine}
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="aspect-square">
            <HeroIllustration alt={HERO_COPY.illustrationAlt} />
          </div>
        </div>
      </div>

      <div className="mt-16 flex justify-center sm:mt-20">
        <ScrollPrompt label={HERO_COPY.scrollPrompt} targetId="act-2" />
      </div>
    </section>
  );
}
