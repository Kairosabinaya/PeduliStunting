import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  IMMUNIZATION_COPY,
  TRACKER_DASHBOARD_SECTIONS,
  trackerChildDashboardSectionRoute,
} from "@/config/tracker";
import { isUuid } from "@/domain/shared/ids";

interface ImmunizationsPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export const metadata: Metadata = {
  title: IMMUNIZATION_COPY.metaTitleSuffix,
};

export const dynamic = "force-dynamic";

export default async function ImmunizationsPage({
  params,
}: ImmunizationsPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  redirect(
    trackerChildDashboardSectionRoute(
      childId,
      TRACKER_DASHBOARD_SECTIONS.immunization,
    ),
  );
}
