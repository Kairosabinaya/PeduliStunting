import type { ModelMetadataDto } from "@/application/model/dtos";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { DASHBOARD_MODEL } from "@/config/dashboard";

import { BaselinesComparison } from "./baselines-comparison";
import { ModelPerformance } from "./model-performance";

export interface ModelSectionProps {
  readonly model: ModelMetadataDto | null;
}

/**
 * Model explanation block: out-of-sample performance always visible, with the
 * baseline comparison tucked behind a disclosure so the reading-averse user
 * never has to scroll prose to use the simulator above.
 */
export function ModelSection({ model }: ModelSectionProps) {
  if (model === null) {
    return (
      <EmptyState
        title={DASHBOARD_MODEL.performanceEmptyTitle}
        description={DASHBOARD_MODEL.performanceEmptyDescription}
      />
    );
  }
  return (
    <div className="space-y-5">
      <Card elevation="sm" padding="md" className="space-y-4">
        <header>
          <h2 className="text-base font-semibold text-foreground">
            {DASHBOARD_MODEL.performanceTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {DASHBOARD_MODEL.performanceDescription}
          </p>
        </header>
        <ModelPerformance metrics={model.metrics} />
      </Card>

      <Card elevation="sm" padding="md" className="space-y-4">
        <header>
          <h2 className="text-base font-semibold text-foreground">
            {DASHBOARD_MODEL.baselinesTitle}
          </h2>
        </header>
        <BaselinesComparison metrics={model.metrics} />
      </Card>
    </div>
  );
}
