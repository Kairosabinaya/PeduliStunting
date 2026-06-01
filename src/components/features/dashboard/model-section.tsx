import type { ModelMetadataDto } from "@/application/model/dtos";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { DASHBOARD_MODEL } from "@/config/dashboard";
import type { ReactNode } from "react";

import { BaselinesComparison } from "./baselines-comparison";
import { ModelComponents } from "./model-components";
import { ModelPerformance } from "./model-performance";

export interface ModelSectionProps {
  readonly model: ModelMetadataDto | null;
}

/** Collapsible card with a chevron affordance (no extra prose). */
function Disclosure({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <Card elevation="sm" padding="md">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-base font-semibold text-foreground marker:hidden">
          <span>{title}</span>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          >
            <path
              d="M5 8l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <div className="mt-4">{children}</div>
      </details>
    </Card>
  );
}

/**
 * Model explanation block: a visual four-step anatomy + out-of-sample
 * performance always visible, with the baseline comparison and the formal
 * equation (+ the local-model caveat) tucked behind disclosures so the
 * reading-averse user never has to scroll prose to use the simulator above.
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
            {DASHBOARD_MODEL.stepsTitle}
          </h2>
        </header>
        <ModelComponents />
      </Card>

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

      <Disclosure title={DASHBOARD_MODEL.baselinesTitle}>
        <BaselinesComparison metrics={model.metrics} />
      </Disclosure>
    </div>
  );
}
