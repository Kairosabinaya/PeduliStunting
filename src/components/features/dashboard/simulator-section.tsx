import type { RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeader } from "@/components/primitives/page-header";
import { DASHBOARD_SIMULATOR, PREDIKSI_HEADER } from "@/config/dashboard";

import { ModelEquation } from "./model-equation";
import {
  PredictorSimulator,
  type SimulatorRegionOption,
} from "./predictor-simulator";

export interface SimulatorSectionProps {
  readonly predictors: readonly IndicatorDefinitionDto[];
  readonly regions: readonly SimulatorRegionOption[];
  readonly etaSign: number;
  readonly initial: {
    readonly kodeBps: string;
    readonly tahun: number;
    readonly fit: RegionFitDto;
  } | null;
}

/**
 * The interactive predictor simulator and its page header. When a fitted region
 * is available the client {@link PredictorSimulator} renders the header (with the
 * region/year controls in the actions slot) and its own focal card; otherwise an
 * empty-state card is shown under a plain header.
 */
export function SimulatorSection({
  predictors,
  regions,
  etaSign,
  initial,
}: SimulatorSectionProps) {
  if (predictors.length > 0 && regions.length > 0 && initial !== null) {
    return (
      <PredictorSimulator
        eyebrow={PREDIKSI_HEADER.eyebrow}
        title={PREDIKSI_HEADER.title}
        description={PREDIKSI_HEADER.description}
        generalEquation={<ModelEquation />}
        predictors={predictors}
        etaSign={etaSign}
        regions={regions}
        initial={initial}
      />
    );
  }
  return (
    <div>
      <PageHeader
        eyebrow={PREDIKSI_HEADER.eyebrow}
        title={PREDIKSI_HEADER.title}
        description={PREDIKSI_HEADER.description}
      />
      <Card padding="lg">
        <EmptyState
          title={DASHBOARD_SIMULATOR.noFitTitle}
          description={DASHBOARD_SIMULATOR.noFitDescription}
        />
      </Card>
    </div>
  );
}
