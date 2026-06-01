import type { ModelMetadataDto, RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { DASHBOARD_MODEL } from "@/config/dashboard";

import { ModelSection } from "./model-section";
import type { SimulatorRegionOption } from "./predictor-simulator";
import { SectionHeading } from "./section-heading";
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
    <div className="space-y-8">
      <SimulatorSection
        predictors={predictors}
        regions={regions}
        etaSign={etaSign}
        initial={initial}
      />
      <div className="space-y-4">
        <SectionHeading as="h2" title={DASHBOARD_MODEL.sectionTitle} />
        <ModelSection model={model} />
      </div>
    </div>
  );
}
