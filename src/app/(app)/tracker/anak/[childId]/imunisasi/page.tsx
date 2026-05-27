import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImmunizationChecklist } from "@/components/features/tracker/immunization-checklist";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import { IMMUNIZATION_COPY } from "@/config/tracker";
import { asChildId, isUuid } from "@/domain/shared/ids";
import {
  fetchChildImmunizations,
  fetchImmunizationSchedule,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

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
  const [schedule, records] = await Promise.all([
    fetchImmunizationSchedule(),
    fetchChildImmunizations(session.userId, asChildId(childId)),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{IMMUNIZATION_COPY.cardTitle}</CardTitle>
        <CardDescription>{IMMUNIZATION_COPY.cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {!schedule.ok ? (
          <ErrorState
            title={IMMUNIZATION_COPY.errorTitle}
            description={schedule.error.message}
          />
        ) : !records.ok ? (
          <ErrorState
            title={IMMUNIZATION_COPY.errorTitle}
            description={records.error.message}
          />
        ) : (
          <ImmunizationChecklist
            childId={childId}
            schedule={schedule.value}
            records={records.value}
          />
        )}
      </CardContent>
    </Card>
  );
}
