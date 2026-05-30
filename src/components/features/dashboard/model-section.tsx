import type { ModelMetadataDto } from "@/application/model/dtos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { DASHBOARD_MODEL, DASHBOARD_SECTIONS } from "@/config/dashboard";

import { BaselinesComparison } from "./baselines-comparison";
import { DashboardSection } from "./dashboard-section";
import { ModelComponents } from "./model-components";
import { ModelEquation } from "./model-equation";
import { ModelPerformance } from "./model-performance";

export interface ModelSectionProps {
  readonly model: ModelMetadataDto | null;
}

/**
 * Section 2 — model explanation: the equation, a plain-language anatomy of the
 * prediction, out-of-sample performance, and the baseline comparison.
 */
export function ModelSection({ model }: ModelSectionProps) {
  return (
    <DashboardSection description={DASHBOARD_SECTIONS.model.description}>
      {model === null ? (
        <EmptyState
          title={DASHBOARD_MODEL.performanceEmptyTitle}
          description={DASHBOARD_MODEL.performanceEmptyDescription}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_MODEL.stepsTitle}</CardTitle>
              <CardDescription>{DASHBOARD_MODEL.stepsLead}</CardDescription>
            </CardHeader>
            <CardContent>
              <ModelComponents />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_MODEL.performanceTitle}</CardTitle>
              <CardDescription>
                {DASHBOARD_MODEL.performanceDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelPerformance metrics={model.metrics} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_MODEL.baselinesTitle}</CardTitle>
              <CardDescription>
                {DASHBOARD_MODEL.baselinesDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BaselinesComparison metrics={model.metrics} />
            </CardContent>
          </Card>
          <Card padding="md">
            <details className="group">
              <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:hidden">
                {DASHBOARD_MODEL.equationTitle}
                <span className="ml-2 text-sm font-normal text-muted-foreground group-open:hidden">
                  (untuk penguji)
                </span>
              </summary>
              <div className="mt-4">
                <ModelEquation />
              </div>
            </details>
          </Card>
        </div>
      )}
    </DashboardSection>
  );
}
