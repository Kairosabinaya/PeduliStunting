import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { DASHBOARD_KPI } from "@/config/dashboard";
import type { SupportedYear } from "@/config/years";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";

import { DashboardShell, type DashboardShellProps } from "./dashboard-shell";
import type { ChoroplethGeometry } from "./dashboard-choropleth-interactive";

export interface DataViewProps {
  readonly dataset: Result<DashboardDatasetDto, AppError>;
  readonly geometry: ChoroplethGeometry;
  readonly initialYear: SupportedYear;
  readonly initialKodeBps: string | null;
}

/**
 * Composes the public `/data` surface (Potret Stunting). Server component that
 * maps the dataset {@link Result} to Error/Empty/Content, then hands the plain
 * dataset + map geometry to the client {@link DashboardShell}, which owns the
 * cross-filter state.
 */
export function DataView({
  dataset,
  geometry,
  initialYear,
  initialKodeBps,
}: DataViewProps) {
  if (!dataset.ok) {
    return (
      <ErrorState
        title={DASHBOARD_KPI.errorTitle}
        description={dataset.error.message}
      />
    );
  }
  if (dataset.value.regions.length === 0 || dataset.value.years.length === 0) {
    return (
      <EmptyState
        title={DASHBOARD_KPI.emptyTitle}
        description={DASHBOARD_KPI.emptyDescription}
      />
    );
  }

  const shellProps: DashboardShellProps = {
    dataset: dataset.value,
    geometry,
    initialYear,
    initialKodeBps,
  };
  return <DashboardShell {...shellProps} />;
}
