"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";

import { HERO_COPY } from "@/config/edukasi";
import { buttonVariants } from "@/components/primitives/button";
import { SIGN_IN_ROUTE } from "@/config/routes";

import { LandingOrb } from "../primitives/landing-orb";
import { ParallaxLayer } from "../primitives/parallax-layer";
import { ScrollPrompt } from "../primitives/scroll-prompt";
import { HeroHeadline } from "./hero-headline";
import { HeroIllustration } from "./hero-illustration";
import { HeroLead } from "./hero-lead";

interface HeroSectionProps {
  /**
   * When true, the hero renders a Masuk / Daftar CTA pair beneath the
   * lead copy. Pass true from the landing-before-login surface (root `/`)
   * so unauthenticated readers get a clear conversion path; leave false
   * from the authenticated `/edukasi` long-read where those CTAs would
   * be redundant (the user is already signed in).
   */
  readonly showAuthCtas?: boolean;
}

/**
 * ACT 1 — hero cold-open. Composes the client headline (per-word reveal)
 * with the static lead paragraph + placeholder illustration. Background is
 * the standard surface (no warm tint anymore — the cool, neutral surface
 * lets the brand-tinted parallax orbs do the visual lifting).
 *
 * Layout:
 *  - Mobile / sub-md: stacked, illustration sits beneath the headline.
 *  - lg+: 2-column with the headline on the left and the illustration on
 *    the right.
 *
 * Snap behaviour: `snap-act` aligns the section start with the
 * `snap-scrollytelling` container so scrolling out of the hero lands
 * cleanly on ACT 2.
 */
export function HeroSection({ showAuthCtas = false }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="act-1"
      aria-labelledby="act-1-eyebrow"
      className="snap-act full-bleed relative isolate flex min-h-dvh flex-col justify-center overflow-hidden bg-background pb-12 pt-24 sm:pt-28 lg:pt-32"
    >
      <ParallaxLayer sectionRef={sectionRef}>
        {({ deepY, midY }) => (
          <>
            <motion.div
              style={{ y: deepY }}
              className="absolute -left-20 top-10 sm:-left-12"
            >
              <LandingOrb tint="primary" size="xl" />
            </motion.div>
            <motion.div
              style={{ y: midY }}
              className="absolute -right-12 bottom-24 sm:right-0"
            >
              <LandingOrb tint="accent" size="lg" />
            </motion.div>
          </>
        )}
      </ParallaxLayer>

      <div className="container relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div>
          <p id="act-1-eyebrow" className="eyebrow mb-6">
            {HERO_COPY.eyebrow}
          </p>
          <HeroHeadline />
          <HeroLead />
          {showAuthCtas ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/sign-up"
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                Daftar gratis
              </Link>
              <Link
                href={SIGN_IN_ROUTE}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Masuk
              </Link>
            </div>
          ) : null}
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

      <div className="relative z-10 mt-16 flex justify-center sm:mt-20">
        <ScrollPrompt label={HERO_COPY.scrollPrompt} targetId="act-2" />
      </div>
    </section>
  );
}
