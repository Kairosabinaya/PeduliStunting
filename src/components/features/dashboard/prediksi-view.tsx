import type { ModelMetadataDto, RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { DASHBOARD_MODEL } from "@/config/dashboard";

import { DashboardFooter } from "./dashboard-footer";
import { ModelSection } from "./model-section";
import type { SimulatorRegionOption } from "./predictor-simulator";
import { SimulatorSection } from "./simulator-section";

export interface PrediksiViewProps {
  readonly predictors: readonly IndicatorDefinitionDto[];
  readonly regions: readonly SimulatorRegionOption[];
  readonly etaSign: number;
  readonly initial: {
    readonly kodeBps: string;
    readonly tahun: number;
    readonly fit: RegionFitDto;
  } | null;
  readonly model: ModelMetadataDto | null;
}

/**
 * Composes the public `/prediksi` surface: the interactive simulator as the
 * centerpiece, with the plain-language "cara kerja model" explanation below it.
 */
export function PrediksiView({
  predictors,
  regions,
  etaSign,
  initial,
  model,
}: PrediksiViewProps) {
  return (
    <div className="space-y-16">
      <SimulatorSection
        predictors={predictors}
        regions={regions}
        etaSign={etaSign}
        initial={initial}
      />

      {/* Solid blue band (landing-style) spanning the full viewport width from
          "Cara kerja model" downward; the inner cards stay on white surfaces so
          they pop against the blue. `full-bleed` breaks out of the page
          container (the layout clips horizontal overflow).
          The pseudo-element `after:absolute` fills the 16-unit bottom padding
          of the layout container so there's no white gap at the end. */}
      <section className="full-bleed relative -mb-16 bg-brand-700 pb-24 pt-10 text-white after:absolute after:inset-x-0 after:-bottom-16 after:h-16 after:bg-brand-700 md:pb-28 md:pt-14">
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 md:px-6">
          <header className="space-y-1.5">
            <h2 className="text-xl font-semibold leading-tight text-white md:text-2xl">
              {DASHBOARD_MODEL.sectionTitle}
            </h2>
            <p className="max-w-prose text-sm text-white/80">
              {DASHBOARD_MODEL.sectionDescription}
            </p>
          </header>
          <ModelSection model={model} />

          <div className="pt-8">
            <DashboardFooter
              className="border-t border-white/20 pt-6 text-sm text-white/70"
              labelClassName="text-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
