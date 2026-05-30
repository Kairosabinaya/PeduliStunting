import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChildDashboard } from "@/components/features/tracker/child-dashboard";
import { ErrorState } from "@/components/primitives/error-state";
import { CHILD_DETAIL_COPY, TRACKER_LIST_COPY } from "@/config/tracker";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { fetchChildById } from "@/lib/tracker-cache";
import { loadChildOverview } from "@/lib/child-overview";
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
  const overview = await loadChildOverview(session.userId, asChildId(childId));

  if (!overview.ok) {
    if (overview.error.kind === "not_found") {
      notFound();
    }
    return (
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={
          overview.error.message || TRACKER_LIST_COPY.errorDescriptionFallback
        }
      />
    );
  }

  return <ChildDashboard data={overview.value} />;
}
