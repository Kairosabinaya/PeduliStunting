import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChildSummary } from "@/components/features/tracker/child-summary";
import { GrowthChartCard } from "@/components/features/tracker/growth-chart-card";
import { ModuleGrid } from "@/components/features/tracker/module-grid";
import { ErrorState } from "@/components/primitives/error-state";
import {
  CHILD_DETAIL_COPY,
  TRACKER_LIST_COPY,
  trackerChildImmunizationsRoute,
  trackerChildMeasurementsRoute,
  trackerChildMilestonesRoute,
} from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { asDateOnly } from "@/domain/shared/date-only";
import {
  fetchChildById,
  fetchChildImmunizations,
  fetchChildMilestones,
  fetchImmunizationSchedule,
  fetchMeasurementsByChild,
  fetchMilestoneCatalog,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

interface ChildOverviewPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export async function generateMetadata({
  params,
}: ChildOverviewPageProps): Promise<Metadata> {
  const { childId } = await params;
  if (!isUuid(childId)) {
    return { title: CHILD_DETAIL_COPY.metaTitleSuffix };
  }
  const session = await requireServerSession();
  const result = await fetchChildById(session.userId, asChildId(childId));
  if (!result.ok) {
    return { title: CHILD_DETAIL_COPY.metaTitleSuffix };
  }
  return {
    title: `${result.value.name} — ${CHILD_DETAIL_COPY.metaTitleSuffix}`,
  };
}

export const dynamic = "force-dynamic";

export default async function ChildOverviewPage({
  params,
}: ChildOverviewPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const child = await fetchChildById(session.userId, childResolved);
  if (!child.ok) {
    if (child.error.kind === "not_found") notFound();
    return (
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={
          child.error.message || TRACKER_LIST_COPY.errorDescriptionFallback
        }
      />
    );
  }

  const [
    measurementsResult,
    immunizationScheduleResult,
    childImmunizationsResult,
    milestoneCatalogResult,
    childMilestonesResult,
  ] = await Promise.all([
    fetchMeasurementsByChild(session.userId, childResolved),
    fetchImmunizationSchedule(),
    fetchChildImmunizations(session.userId, childResolved),
    fetchMilestoneCatalog(),
    fetchChildMilestones(session.userId, childResolved),
  ]);

  if (!measurementsResult.ok) {
    return (
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={
          measurementsResult.error.message ||
          TRACKER_LIST_COPY.errorDescriptionFallback
        }
      />
    );
  }

  const measurements = measurementsResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.value.birthDate),
    asDateOnly(todayIsoString()),
  );

  return (
    <div className="space-y-6">
      <ChildSummary measurements={measurements} />
      <ModuleGrid
        childAgeMonths={childAgeMonths}
        childDetailRoutes={{
          measurements: trackerChildMeasurementsRoute(child.value.id),
          immunizations: trackerChildImmunizationsRoute(child.value.id),
          milestones: trackerChildMilestonesRoute(child.value.id),
        }}
        measurements={measurements}
        immunizationSchedule={
          immunizationScheduleResult.ok ? immunizationScheduleResult.value : []
        }
        childImmunizations={
          childImmunizationsResult.ok ? childImmunizationsResult.value : []
        }
        milestoneCatalog={
          milestoneCatalogResult.ok ? milestoneCatalogResult.value : []
        }
        childMilestones={
          childMilestonesResult.ok ? childMilestonesResult.value : []
        }
      />
      <GrowthChartCard child={child.value} measurements={measurements} />
    </div>
  );
}

function todayIsoString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
