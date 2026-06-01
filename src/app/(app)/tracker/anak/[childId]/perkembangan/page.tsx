import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  MILESTONE_COPY,
  TRACKER_DASHBOARD_SECTIONS,
  trackerChildDashboardSectionRoute,
} from "@/config/tracker";
import { isUuid } from "@/domain/shared/ids";

interface MilestonesPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export const metadata: Metadata = {
  title: MILESTONE_COPY.metaTitleSuffix,
};

export const dynamic = "force-dynamic";

export default async function MilestonesPage({ params }: MilestonesPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  redirect(
    trackerChildDashboardSectionRoute(
      childId,
      TRACKER_DASHBOARD_SECTIONS.development,
    ),
  );
}
