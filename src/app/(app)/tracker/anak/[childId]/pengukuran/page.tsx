import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MeasurementForm } from "@/components/features/tracker/measurement-form";
import { MeasurementHistory } from "@/components/features/tracker/measurement-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import { MEASUREMENTS_COPY } from "@/config/tracker";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { fetchMeasurementsByChild } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

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

  const session = await requireServerSession();
  const measurements = await fetchMeasurementsByChild(
    session.userId,
    asChildId(childId),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{MEASUREMENTS_COPY.addCardTitle}</CardTitle>
          <CardDescription>
            {MEASUREMENTS_COPY.addCardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementForm childId={childId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{MEASUREMENTS_COPY.historyTitle}</CardTitle>
          <CardDescription>
            {MEASUREMENTS_COPY.historyDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {measurements.ok ? (
            <MeasurementHistory measurements={measurements.value} />
          ) : (
            <ErrorState
              title={MEASUREMENTS_COPY.errorTitle}
              description={measurements.error.message}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
