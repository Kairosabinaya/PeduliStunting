import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
import { asChildId, isUuid } from "@/domain/shared/ids";
import {
  fetchChildMilestones,
  fetchMilestoneCatalog,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

interface MilestonesPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export const metadata: Metadata = {
  title: MILESTONE_COPY.metaTitleSuffix,
};

export const dynamic = "force-dynamic";

export default async function MilestonesPage({
  params,
}: MilestonesPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  const session = await requireServerSession();
  const [catalog, records] = await Promise.all([
    fetchMilestoneCatalog(),
    fetchChildMilestones(session.userId, asChildId(childId)),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{MILESTONE_COPY.cardTitle}</CardTitle>
        <CardDescription>{MILESTONE_COPY.cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {!catalog.ok ? (
          <ErrorState
            title={MILESTONE_COPY.errorTitle}
            description={catalog.error.message}
          />
        ) : !records.ok ? (
          <ErrorState
            title={MILESTONE_COPY.errorTitle}
            description={records.error.message}
          />
        ) : (
          <MilestoneChecklist
            childId={childId}
            catalog={catalog.value}
            records={records.value}
          />
        )}
      </CardContent>
    </Card>
  );
}
