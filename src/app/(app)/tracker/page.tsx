import type { Metadata } from "next";
import Link from "next/link";

import { EmptyChildDashboard } from "@/components/features/tracker/empty-child-dashboard";
import { PregnancyBanner } from "@/components/features/tracker/pregnancy-banner";
import { TrackerChildSection } from "@/components/features/tracker/tracker-child-section";
import { buttonVariants } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import { TRACKER_LIST_COPY, TRACKER_NEW_CHILD_ROUTE } from "@/config/tracker";
import { fetchChildrenByOwner } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

export const metadata: Metadata = {
  title: TRACKER_LIST_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

interface TrackerPageProps {
  readonly searchParams: Promise<{ readonly anak?: string }>;
}

/**
 * Tracker home — a friendly per-child dashboard rather than a grid of cards.
 * It opens straight onto one child's full picture (growth summary, the four
 * domain modules, and the WHO curve) with a switcher when the account has more
 * than one child. With no children yet, the dashboard frame still shows
 * (disabled modules) beside a prominent "Tambah anak" call to action so a first
 * visit communicates what the tracker does.
 */
export default async function TrackerPage({ searchParams }: TrackerPageProps) {
  const session = await requireServerSession();
  const childrenResult = await fetchChildrenByOwner(session.userId);
  const { anak } = await searchParams;

  const addChildCta = (
    <Link
      href={TRACKER_NEW_CHILD_ROUTE}
      className={buttonVariants({ variant: "primary" })}
    >
      {TRACKER_LIST_COPY.addCta}
    </Link>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={TRACKER_LIST_COPY.eyebrow}
        title={TRACKER_LIST_COPY.title}
        description={TRACKER_LIST_COPY.description}
        actions={addChildCta}
      />

      <PregnancyBanner />

      {!childrenResult.ok ? (
        <ErrorState
          title={TRACKER_LIST_COPY.errorTitle}
          description={
            childrenResult.error.message ||
            TRACKER_LIST_COPY.errorDescriptionFallback
          }
        />
      ) : childrenResult.value.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            title={TRACKER_LIST_COPY.emptyTitle}
            description={TRACKER_LIST_COPY.emptyDescription}
            action={addChildCta}
          />
          <EmptyChildDashboard />
        </div>
      ) : (
        <TrackerChildSection
          childProfiles={childrenResult.value}
          userId={session.userId}
          requestedChildId={anak}
        />
      )}
    </div>
  );
}
