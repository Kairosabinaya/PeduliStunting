import type { Metadata } from "next";

import { PregnancyOverviewHeader } from "@/components/features/tracker/pregnancy-overview-header";
import { PregnancyProfileForm } from "@/components/features/tracker/pregnancy-profile-form";
import { PregnancyTabs } from "@/components/features/tracker/pregnancy-tabs";
import { Card } from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import { PREGNANCY_PAGE_COPY } from "@/config/tracker";
import { asPregnancyId } from "@/domain/shared/ids";
import { buildOverview } from "@/domain/pregnancy/services/pregnancy-status";
import {
  fetchActivePregnancy,
  fetchPregnancyEvents,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";

export const metadata: Metadata = {
  title: PREGNANCY_PAGE_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

export default async function PregnancyPage() {
  const session = await requireServerSession();
  const pregnancyResult = await fetchActivePregnancy(session.userId);

  if (!pregnancyResult.ok) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={PREGNANCY_PAGE_COPY.eyebrow}
          title={PREGNANCY_PAGE_COPY.title}
          description={PREGNANCY_PAGE_COPY.description}
        />
        <ErrorState
          title={PREGNANCY_PAGE_COPY.errorTitle}
          description={pregnancyResult.error.message}
        />
      </div>
    );
  }

  const pregnancy = pregnancyResult.value;

  if (!pregnancy) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={PREGNANCY_PAGE_COPY.eyebrow}
          title={PREGNANCY_PAGE_COPY.title}
          description={PREGNANCY_PAGE_COPY.description}
        />
        <Card elevation="sm" padding="md" className="space-y-4">
          <header>
            <h2 className="text-base font-semibold text-foreground">
              {PREGNANCY_PAGE_COPY.emptyTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {PREGNANCY_PAGE_COPY.emptyDescription}
            </p>
          </header>
          <PregnancyProfileForm pregnancy={null} />
        </Card>
      </div>
    );
  }

  const eventsResult = await fetchPregnancyEvents(
    session.userId,
    asPregnancyId(pregnancy.id),
  );

  if (!eventsResult.ok) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={PREGNANCY_PAGE_COPY.eyebrow}
          title={PREGNANCY_PAGE_COPY.title}
          description={PREGNANCY_PAGE_COPY.description}
        />
        <ErrorState
          title={PREGNANCY_PAGE_COPY.errorTitle}
          description={eventsResult.error.message}
        />
      </div>
    );
  }

  const referenceDate = todayIso();
  const overview = buildOverview(
    pregnancy.hpht,
    pregnancy.expectedDue,
    referenceDate,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={PREGNANCY_PAGE_COPY.eyebrow}
        title={PREGNANCY_PAGE_COPY.title}
        description={PREGNANCY_PAGE_COPY.description}
      />
      <PregnancyOverviewHeader overview={overview} />
      <Card elevation="sm" padding="md">
        <PregnancyTabs
          pregnancy={pregnancy}
          overview={overview}
          events={eventsResult.value}
        />
      </Card>
    </div>
  );
}
