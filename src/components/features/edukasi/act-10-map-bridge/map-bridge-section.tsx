import Link from "next/link";

import { MAP_BRIDGE_COPY } from "@/config/edukasi";
import { buttonVariants } from "@/components/primitives/button";
import { PROVINCE_HIGHLIGHTS } from "@/data/edukasi/province-highlights";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";

import { IndonesiaOutline } from "./indonesia-outline";

const TONE_TO_BADGE = {
  success: "bg-accent/15 text-accent-foreground border-accent/40",
  neutral: "bg-surface text-foreground border-border",
  danger: "bg-edu-flag/12 text-foreground border-edu-flag/40",
} as const;

/**
 * ACT 10 — Bridge ke peta nasional. Highlight provinsi terbaik + outline
 * SVG sederhana + dua CTA (peta, dashboard).
 */
export function MapBridgeSection() {
  return (
    <ActSection
      id="act-10"
      eyebrow={MAP_BRIDGE_COPY.eyebrow}
      maxWidth="wide"
      className="bg-primary-soft/5"
    >
      <FadeInView as="div" className="max-w-prose">
        <h2 className="section-headline text-balance text-foreground">
          <span>{MAP_BRIDGE_COPY.headlineLead}</span>{" "}
          <HighlightWord variant={MAP_BRIDGE_COPY.headlineHighlight.variant}>
            {MAP_BRIDGE_COPY.headlineHighlight.value}
          </HighlightWord>
          <span>{MAP_BRIDGE_COPY.headlineTail}</span>
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          {MAP_BRIDGE_COPY.body}
        </p>
      </FadeInView>

      <FadeInView as="div" delayMs={120} className="mt-12">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="mx-auto aspect-[16/7] w-full max-w-3xl">
            <IndonesiaOutline
              ariaLabel={MAP_BRIDGE_COPY.illustrationAlt}
              className="h-full w-full"
            />
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              {MAP_BRIDGE_COPY.topPerformersTitle}
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PROVINCE_HIGHLIGHTS.map((p) => (
                <li
                  key={p.id}
                  className={`rounded-xl border px-3 py-2 text-sm ${TONE_TO_BADGE[p.tone]}`}
                >
                  <p className="font-semibold">
                    {p.label}
                    <span className="ml-2 font-normal tabular-nums">
                      {p.prevalencePct.toLocaleString("id-ID", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FadeInView>

      <FadeInView
        as="div"
        delayMs={180}
        className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
      >
        <Link
          href={MAP_BRIDGE_COPY.ctaPrimary.href}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          {MAP_BRIDGE_COPY.ctaPrimary.label}
        </Link>
        <Link
          href={MAP_BRIDGE_COPY.ctaSecondary.href}
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          {MAP_BRIDGE_COPY.ctaSecondary.label}
        </Link>
      </FadeInView>
    </ActSection>
  );
}
