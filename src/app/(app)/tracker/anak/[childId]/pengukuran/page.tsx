import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  MEASUREMENTS_COPY,
  TRACKER_DASHBOARD_SECTIONS,
  trackerChildDashboardSectionRoute,
} from "@/config/tracker";
import { isUuid } from "@/domain/shared/ids";

interface MeasurementsPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export const metadata: Metadata = {
  title: MEASUREMENTS_COPY.metaTitleSuffix,
};

export const dynamic = "force-dynamic";

export default async function MeasurementsPage({
  params,
}: MeasurementsPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  redirect(
    trackerChildDashboardSectionRoute(
      childId,
      TRACKER_DASHBOARD_SECTIONS.growth,
    ),
  );
}
