import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImmunizationEducationCard } from "@/components/features/tracker/immunization-education-card";
import { ImmunizationProgress } from "@/components/features/tracker/immunization-progress";
import { ImmunizationTimeline } from "@/components/features/tracker/immunization-timeline";
import { Card } from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import {
  IMMUNIZATION_COPY,
  IMMUNIZATION_TIMELINE_COPY,
} from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asDateOnly } from "@/domain/shared/date-only";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { computeImmunizationProgress } from "@/domain/health-plan/services/immunization-status";
import {
  fetchChildById,
  fetchChildImmunizations,
  fetchImmunizationSchedule,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";

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

  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, scheduleResult, recordsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchImmunizationSchedule(),
    fetchChildImmunizations(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    if (childResult.error.kind === "not_found") notFound();
    return (
      <ErrorState
        title={IMMUNIZATION_COPY.errorTitle}
        description={childResult.error.message}
      />
    );
  }
  if (!scheduleResult.ok) {
    return (
      <ErrorState
        title={IMMUNIZATION_COPY.errorTitle}
        description={scheduleResult.error.message}
      />
    );
  }
  if (!recordsResult.ok) {
    return (
      <ErrorState
        title={IMMUNIZATION_COPY.errorTitle}
        description={recordsResult.error.message}
      />
    );
  }

  const schedule = scheduleResult.value;
  const records = recordsResult.value;
  const child = childResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.birthDate),
    asDateOnly(todayIso()),
  );
  const recordByCode = new Map(
    records.map((record) => [record.immunizationCode, record]),
  );
  const progress = computeImmunizationProgress(
    schedule.map((item) => ({
      recommendedAgeMonths: item.recommendedAgeMonths,
      recordStatus: recordByCode.get(item.code)?.status ?? null,
    })),
    childAgeMonths,
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ImmunizationProgress done={progress.done} due={progress.due} />
        </div>
        <div className="lg:col-span-2">
          <ImmunizationEducationCard />
        </div>
      </div>
      <Card elevation="sm" padding="md" className="space-y-4">
        <header>
          <h2 className="text-base font-semibold text-foreground">
            {IMMUNIZATION_TIMELINE_COPY.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {IMMUNIZATION_TIMELINE_COPY.description}
          </p>
        </header>
        <ImmunizationTimeline
          childId={childId}
          childAgeMonths={childAgeMonths}
          schedule={schedule}
          records={records}
        />
      </Card>
    </div>
  );
}
