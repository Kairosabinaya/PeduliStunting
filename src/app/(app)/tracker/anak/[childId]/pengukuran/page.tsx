import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MeasurementForm } from "@/components/features/tracker/measurement-form";
import { MeasurementHistory } from "@/components/features/tracker/measurement-history";
import { Card } from "@/components/primitives/card";
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
    <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
      <Card elevation="sm" padding="md" className="space-y-4 lg:col-span-3">
        <header>
          <h2 className="text-base font-semibold text-foreground">
            {MEASUREMENTS_COPY.addCardTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {MEASUREMENTS_COPY.addCardDescription}
          </p>
        </header>
        <MeasurementForm childId={childId} />
      </Card>

      <Card elevation="sm" padding="md" className="space-y-4 lg:col-span-2">
        <header>
          <h2 className="text-base font-semibold text-foreground">
            {MEASUREMENTS_COPY.historyTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {MEASUREMENTS_COPY.historyDescription}
          </p>
        </header>
        {measurements.ok ? (
          <MeasurementHistory measurements={measurements.value} />
        ) : (
          <ErrorState
            title={MEASUREMENTS_COPY.errorTitle}
            description={measurements.error.message}
          />
        )}
      </Card>
    </div>
  );
}
