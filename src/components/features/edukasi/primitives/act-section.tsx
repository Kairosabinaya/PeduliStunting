import { forwardRef } from "react";

import { cn } from "@/lib/cn";

export interface ActSectionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "id"
> {
  /** Stable section id used for anchor scrolling (e.g. `act-3`). */
  readonly id: string;
  /** Eyebrow label rendered above the headline. */
  readonly eyebrow?: string;
  /** When true, applies the dark band styling (ACT 9, ACT 11 closing). */
  readonly dark?: boolean;
  /** When true, applies the cream tint background (ACT 7). */
  readonly cream?: boolean;
  /** Container max width override. */
  readonly maxWidth?: "narrow" | "default" | "wide";
  /**
   * Render the top gradient bridge (dark/cream variants only). Default true.
   * Set to false when the previous section already ends with the same tone
   * so the auto-bridge would create a visible hard band (e.g. dark → dark
   * across a vignetted section).
   */
  readonly bridgeTop?: boolean;
  /**
   * Render the bottom gradient bridge (dark/cream variants only). Default
   * true. Set to false when the next section starts with the same tone so
   * the auto-bridge would create a visible hard band — e.g. ACT 9 (dark)
   * → ACT 10 (vignette starting at edu-night) → ACT 11 (dark). Without
   * this opt-out ACT 9's bottom fades to light, then ACT 10 jumps back to
   * dark via vignette, producing the "patah" band the user reported.
   */
  readonly bridgeBottom?: boolean;
}

const MAX_WIDTH_CLASS = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

/**
 * Wrapper section for every ACT. Provides:
 *  - a stable id for in-page anchors,
 *  - generous vertical padding tuned for scrollytelling rhythm,
 *  - background tint variants (default, cream for ACT 7, night for ACT 9/11),
 *  - an eyebrow slot rendered with the `.eyebrow` utility for visual unity.
 *
 * @example Default light section
 * ```tsx
 * <ActSection id="act-1" eyebrow="Edukasi pencegahan stunting">
 *   <h2 className="display-headline">...</h2>
 * </ActSection>
 * ```
 *
 * @example Dark band closing
 * ```tsx
 * <ActSection id="act-11" eyebrow="Penutup" dark>
 *   <h2 className="section-headline">...</h2>
 * </ActSection>
 * ```
 */
export const ActSection = forwardRef<HTMLElement, ActSectionProps>(
  function ActSection(
    {
      id,
      eyebrow,
      dark = false,
      cream = false,
      maxWidth = "default",
      bridgeTop = true,
      bridgeBottom = true,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={`${id}-eyebrow`}
        className={cn(
          // `scroll-mt-32` (8rem ≈ 128px) reserves room for the floating
          // navbar pill when an in-page anchor (footnote sup, scroll
          // prompt) jumps to this section. Combined with FloatingHeader's
          // auto-hide on scroll-down, the heading is never obscured.
          // `full-bleed` makes the section span the full viewport width,
          // escaping the `(app)` layout's max-w-6xl container so dark and
          // cream bands don't leave light strips on the sides.
          // `min-h-dvh flex items-center` ensures every ACT fits one viewport
          // and is vertically centered so the snap-scrollytelling scroll
          // pattern (see globals.css `.snap-scrollytelling`) feels like
          // "one screen, one chapter". Long content overflows naturally.
          // `items-stretch` (not `items-center`) so the inner container can
          // grow to its `max-w-*` width via its own `mx-auto`. The flex is
          // only used to vertically center content via `justify-center`.
          "snap-act full-bleed relative flex min-h-dvh scroll-mt-32 flex-col items-stretch justify-center py-16 sm:py-20",
          dark && "bg-edu-night text-white",
          cream && "bg-edu-tint-cream text-foreground",
          !dark && !cream && "bg-background text-foreground",
          className,
        )}
        {...rest}
      >
        {dark ? (
          <>
            {/* Two-sided gradient bridge so the dark band fades INTO and
              OUT OF surrounding light sections instead of cutting hard
              at the boundary. The strip is overlaid on the section's
              solid dark bg, so `from-background` (light) at the leading
              edge actually shows light, then transitions to solid dark
              over 80px. Mirrored at the bottom for the exit.

              Each bridge is gated by a prop so sections whose neighbour
              already ends/starts in the same tone can opt out — the
              auto-bridge would otherwise create a hard "patah" band
              (visible in ACT 9 → ACT 10 vignette → ACT 11 where every
              section is dark-ish). */}
            {bridgeTop ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-edu-night"
              />
            ) : null}
            {bridgeBottom ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-edu-night to-background"
              />
            ) : null}
          </>
        ) : null}
        {cream ? (
          <>
            {/* Cream section bridge — same pattern as dark, but fading
              between the body background and the cream tint. */}
            {bridgeTop ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-edu-tint-cream"
              />
            ) : null}
            {bridgeBottom ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-edu-tint-cream to-background"
              />
            ) : null}
          </>
        ) : null}
        <div
          className={cn(
            "container relative mx-auto px-4 sm:px-6",
            MAX_WIDTH_CLASS[maxWidth],
          )}
        >
          {eyebrow ? (
            <p
              id={`${id}-eyebrow`}
              className={cn("eyebrow mb-6", dark && "text-white/70")}
            >
              {eyebrow}
            </p>
          ) : null}
          {children}
        </div>
      </section>
    );
  },
);
