import type { RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { DASHBOARD_SECTIONS, DASHBOARD_SIMULATOR } from "@/config/dashboard";

import { DashboardSection } from "./dashboard-section";
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
 * Section 3 — the interactive predictor. Server component: it renders the
 * empty state when no fitted region is available, otherwise mounts the client
 * {@link PredictorSimulator} with a pre-loaded initial region so there is no
 * loading flash on first paint.
 */
export function SimulatorSection({
  predictors,
  regions,
  etaSign,
  initial,
}: SimulatorSectionProps) {
  const ready = predictors.length > 0 && regions.length > 0 && initial !== null;
  return (
    <DashboardSection description={DASHBOARD_SECTIONS.simulator.description}>
      <Card padding="lg">
        {ready ? (
          <PredictorSimulator
            predictors={predictors}
            etaSign={etaSign}
            regions={regions}
            initial={initial}
          />
        ) : (
          <EmptyState
            title={DASHBOARD_SIMULATOR.noFitTitle}
            description={DASHBOARD_SIMULATOR.noFitDescription}
          />
        )}
      </Card>
    </DashboardSection>
  );
}
