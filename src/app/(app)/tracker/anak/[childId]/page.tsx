import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChildSummary } from "@/components/features/tracker/child-summary";
import { GrowthChartCard } from "@/components/features/tracker/growth-chart-card";
import { ErrorState } from "@/components/primitives/error-state";
import { CHILD_DETAIL_COPY, TRACKER_LIST_COPY } from "@/config/tracker";
import { asChildId, isUuid } from "@/domain/shared/ids";
import {
  fetchChildById,
  fetchMeasurementsByChild,
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
  const child = await fetchChildById(session.userId, asChildId(childId));
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

  const measurements = await fetchMeasurementsByChild(
    session.userId,
    asChildId(childId),
  );

  return (
    <div className="space-y-6">
      {!measurements.ok ? (
        <ErrorState
          title={TRACKER_LIST_COPY.errorTitle}
          description={
            measurements.error.message ||
            TRACKER_LIST_COPY.errorDescriptionFallback
          }
        />
      ) : (
        <>
          <ChildSummary measurements={measurements.value} />
          <GrowthChartCard
            child={child.value}
            measurements={measurements.value}
          />
        </>
      )}
    </div>
  );
}
