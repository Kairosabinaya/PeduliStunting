"use client";

import { Fragment, useRef } from "react";
import { motion } from "motion/react";

import { POSYANDU_COPY } from "@/config/edukasi";
import {
  POSYANDU_SERVICES,
  type PosyanduService,
} from "@/data/edukasi/posyandu";
import { cn } from "@/lib/cn";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";
import { LandingOrb } from "../primitives/landing-orb";
import { ParallaxLayer } from "../primitives/parallax-layer";

import { ImmunizationModalLauncher } from "./immunization-modal";
import { ServiceIcon } from "./service-icon";

/**
 * ACT 8 — Posyandu. Header (ringkasan + CTA modal jadwal imunisasi) di atas,
 * lalu empat layanan inti sebagai timeline bergaris: desktop = garis horizontal
 * dengan titik berselang atas-bawah; mobile = garis vertikal (titik di kiri,
 * judul + penjelasan di kanan).
 *
 * Decorated with a `<ParallaxLayer>` background so the white section gets
 * subtle ambient depth.
 */

// Static column-start classes for the desktop grid (data is a fixed 4 items).
const COL_START = [
  "col-start-1",
  "col-start-2",
  "col-start-3",
  "col-start-4",
] as const;

function ServiceNode({ service }: { readonly service: PosyanduService }) {
  return (
    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary shadow-sm ring-1 ring-primary/25 transition-[transform,box-shadow] duration-fast hover:scale-110 hover:shadow-md hover:ring-primary/60 motion-reduce:transition-none motion-reduce:hover:scale-100">
      <ServiceIcon icon={service.icon} className="h-7 w-7" />
    </span>
  );
}

function ServiceText({
  service,
  className,
}: {
  readonly service: PosyanduService;
  readonly className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-base font-semibold text-foreground sm:text-lg">
        {service.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-foreground/80">
        {service.description}
      </p>
    </div>
  );
}

/**
 * Desktop horizontal timeline. A centred line threads four nodes; labels sit
 * above (even index) or below (odd index). Equal `1fr` top/bottom rows (via
 * `.edu-timeline-grid`) keep the line straight regardless of label length.
 */
function HorizontalTimeline() {
  return (
    <ol
      className="edu-timeline-grid relative mt-12 hidden gap-x-6 md:grid md:grid-cols-4"
      aria-label={POSYANDU_COPY.eyebrow}
    >
      {/* `col-start-1` is essential: without an explicit start the grid
          auto-places this `col-span-4` band, and since the four nodes already
          fill every column of row 2, it gets pushed into implicit columns 5–8
          (off to the right) — the line then "disappears" except a sliver.
          A definite placement (cols 1–4, row 2) is allowed to overlap the
          nodes, so the line paints full-width behind the circles (nodes carry
          `relative z-10`). */}
      <span
        aria-hidden="true"
        className="col-span-4 col-start-1 row-start-2 h-0.5 self-center rounded-full bg-gradient-to-r from-primary/70 via-primary-soft/60 to-accent/70"
      />
      {POSYANDU_SERVICES.map((service, index) => {
        const above = index % 2 === 0;
        const col = COL_START[index] ?? "col-start-1";
        return (
          <Fragment key={service.id}>
            <li
              className={cn(
                col,
                "list-none px-2 text-center",
                above
                  ? "row-start-1 self-end pb-5"
                  : "row-start-3 self-start pt-5",
              )}
            >
              <ServiceText service={service} />
            </li>
            {/* `li`, not `div`: an `ol` may only contain li/script/template
                children (axe `list`). The node is decorative chrome for the
                text entry above/below it, so it opts out of list semantics
                with `list-none` + aria-hidden. */}
            <li
              aria-hidden="true"
              className={cn(col, "row-start-2 flex list-none justify-center")}
            >
              <ServiceNode service={service} />
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

/**
 * Mobile vertical timeline. A left rail threads the nodes top-to-bottom, with
 * each service's title + description to the right.
 */
function VerticalTimeline() {
  return (
    <ol className="relative mt-10 md:hidden">
      <span
        aria-hidden="true"
        className="absolute bottom-4 left-7 top-4 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/60 via-primary-soft/50 to-accent/60"
      />
      {POSYANDU_SERVICES.map((service) => (
        <li
          key={service.id}
          className="grid grid-cols-[auto_1fr] items-start gap-4 pb-8 last:pb-0"
        >
          <div className="flex w-14 justify-center">
            <ServiceNode service={service} />
          </div>
          <ServiceText service={service} className="pt-2" />
        </li>
      ))}
    </ol>
  );
}

export function PosyanduSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <ActSection
      ref={sectionRef}
      id="act-8"
      eyebrow={POSYANDU_COPY.eyebrow}
      maxWidth="wide"
    >
      <ParallaxLayer sectionRef={sectionRef}>
        {({ deepY, midY }) => (
          <>
            <motion.div
              style={{ y: deepY }}
              className="absolute -left-16 top-8"
            >
              <LandingOrb tint="accent" size="lg" />
            </motion.div>
            <motion.div
              style={{ y: midY }}
              className="absolute bottom-12 right-0"
            >
              <LandingOrb tint="primary" size="md" />
            </motion.div>
          </>
        )}
      </ParallaxLayer>

      <div className="relative z-10">
        <FadeInView as="div" className="max-w-3xl">
          <h2 className="section-headline text-balance text-foreground">
            <span>{POSYANDU_COPY.headlineLead}</span>{" "}
            <HighlightWord variant={POSYANDU_COPY.headlineHighlight.variant}>
              {POSYANDU_COPY.headlineHighlight.value}
            </HighlightWord>{" "}
            <span>{POSYANDU_COPY.headlineTail}</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {POSYANDU_COPY.body}
          </p>
          <div className="mt-6">
            <ImmunizationModalLauncher />
          </div>
        </FadeInView>

        <FadeInView as="div" delayMs={120}>
          <HorizontalTimeline />
          <VerticalTimeline />
        </FadeInView>
      </div>
    </ActSection>
  );
}
