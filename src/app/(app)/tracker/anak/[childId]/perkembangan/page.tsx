import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MilestoneAlertBanner } from "@/components/features/tracker/milestone-alert-banner";
import { MilestoneChecklist } from "@/components/features/tracker/milestone-checklist";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import { MILESTONE_COPY } from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asDateOnly } from "@/domain/shared/date-only";
import { computeMilestoneAlert } from "@/domain/health-plan/services/milestone-status";
import { asChildId, isUuid } from "@/domain/shared/ids";
import {
  fetchChildById,
  fetchChildMilestones,
  fetchMilestoneCatalog,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";

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

  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, catalogResult, recordsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchMilestoneCatalog(),
    fetchChildMilestones(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    if (childResult.error.kind === "not_found") notFound();
    return (
      <ErrorState
        title={MILESTONE_COPY.errorTitle}
        description={childResult.error.message}
      />
    );
  }
  if (!catalogResult.ok) {
    return (
      <ErrorState
        title={MILESTONE_COPY.errorTitle}
        description={catalogResult.error.message}
      />
    );
  }
  if (!recordsResult.ok) {
    return (
      <ErrorState
        title={MILESTONE_COPY.errorTitle}
        description={recordsResult.error.message}
      />
    );
  }

  const child = childResult.value;
  const catalog = catalogResult.value;
  const records = recordsResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.birthDate),
    asDateOnly(todayIso()),
  );
  const alert = computeMilestoneAlert(
    catalog.map((item) => ({
      id: item.id,
      domain: item.domain,
      minAgeMonths: item.minAgeMonths,
      maxAgeMonths: item.maxAgeMonths,
    })),
    records.map((record) => ({
      milestoneId: record.milestoneId,
      status: record.status,
    })),
    childAgeMonths,
  );

  return (
    <div className="space-y-4">
      {alert.shouldAlert ? (
        <MilestoneAlertBanner delayedCount={alert.delayedCount} />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{MILESTONE_COPY.cardTitle}</CardTitle>
          <CardDescription>{MILESTONE_COPY.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <MilestoneChecklist
            childId={childId}
            childAgeMonths={childAgeMonths}
            catalog={catalog}
            records={records}
          />
        </CardContent>
      </Card>
    </div>
  );
}
