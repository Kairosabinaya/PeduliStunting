import { POSYANDU_COPY } from "@/config/edukasi";
import { POSYANDU_SERVICES } from "@/data/edukasi/posyandu";

import { ActSection } from "../primitives/act-section";
import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";

import { ImmunizationModalLauncher } from "./immunization-modal";
import { ServiceIcon } from "./service-icon";

/**
 * ACT 8 — Posyandu. Split layout di lg: kiri ringkasan + CTA, kanan
 * empat service tile. Bottom: launcher untuk modal jadwal imunisasi.
 */
export function PosyanduSection() {
  return (
    <ActSection id="act-8" eyebrow={POSYANDU_COPY.eyebrow} maxWidth="wide">
      <div className="grid gap-12 lg:grid-cols-[3fr_4fr] lg:gap-16">
        <FadeInView as="div" className="max-w-prose">
          <h2 className="section-headline text-balance text-foreground">
            <span>{POSYANDU_COPY.headlineLead}</span>{" "}
            <HighlightWord variant={POSYANDU_COPY.headlineHighlight.variant}>
              {POSYANDU_COPY.headlineHighlight.value}
            </HighlightWord>{" "}
            <span>{POSYANDU_COPY.headlineTail}</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            {POSYANDU_COPY.body}
          </p>
          <div className="mt-8">
            <ImmunizationModalLauncher />
          </div>
        </FadeInView>

        <FadeInView as="div" delayMs={120}>
          <div className="grid gap-4 sm:grid-cols-2">
            {POSYANDU_SERVICES.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ServiceIcon icon={service.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </FadeInView>
      </div>
    </ActSection>
  );
}
