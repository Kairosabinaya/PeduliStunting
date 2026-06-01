import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  CHILD_DETAIL_COPY,
  TRACKER_DASHBOARD_SECTIONS,
  trackerChildDashboardSectionRoute,
  trackerChildEditRoute,
  trackerChildNutritionRoute,
  trackerSelectChildRoute,
} from "@/config/tracker";
import { isUuid } from "@/domain/shared/ids";

interface ChildOverviewPageProps {
  readonly params: Promise<{ readonly childId: string }>;
  readonly searchParams: Promise<{ readonly modal?: string }>;
}

export const metadata: Metadata = {
  title: CHILD_DETAIL_COPY.metaTitleSuffix,
};

export const dynamic = "force-dynamic";

export default async function ChildOverviewPage({
  params,
  searchParams,
}: ChildOverviewPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  const { modal } = await searchParams;

  switch (modal) {
    case "edit":
      redirect(trackerChildEditRoute(childId));
    case "tambah-pengukuran":
    case "pengukuran":
      redirect(
        trackerChildDashboardSectionRoute(
          childId,
          TRACKER_DASHBOARD_SECTIONS.growth,
        ),
      );
    case "imunisasi":
      redirect(
        trackerChildDashboardSectionRoute(
          childId,
          TRACKER_DASHBOARD_SECTIONS.immunization,
        ),
      );
    case "perkembangan":
      redirect(
        trackerChildDashboardSectionRoute(
          childId,
          TRACKER_DASHBOARD_SECTIONS.development,
        ),
      );
    case "gizi":
      redirect(trackerChildNutritionRoute(childId));
    default:
      redirect(trackerSelectChildRoute(childId));
  }
}
