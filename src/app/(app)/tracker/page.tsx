import type { Metadata } from "next";

import { AiChatMount } from "@/components/features/ai/ai-chat-mount";
import { EmptyChildDashboard } from "@/components/features/tracker/empty-child-dashboard";
import { TrackerChildSection } from "@/components/features/tracker/tracker-child-section";
import { TrackerModalButton } from "@/components/features/tracker/tracker-modal-button";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import { TRACKER_LIST_COPY, TRACKER_MODAL } from "@/config/tracker";
import { fetchChildrenByOwner } from "@/lib/tracker-cache";
import { resolveEditTarget } from "@/lib/tracker-edit-target";
import { requireServerSession } from "@/lib/server-session";
import { TrackerEditChildModal } from "@/components/features/tracker/modals/tracker-edit-child-modal";
import { TrackerAddChildModal } from "@/components/features/tracker/modals/tracker-add-child-modal";
import { TrackerAddMeasurementModal } from "@/components/features/tracker/modals/tracker-add-measurement-modal";

export const metadata: Metadata = {
  title: TRACKER_LIST_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

interface TrackerPageProps {
  readonly searchParams: Promise<{
    readonly anak?: string;
    readonly modal?: string;
  }>;
}

/**
 * Tracker home — a friendly per-child dashboard rather than a grid of cards.
 * It opens straight onto one child's full picture (growth summary, the four
 * domain modules, and the WHO curve) with a switcher when the account has more
 * than one child. With no children yet, the dashboard frame still shows the
 * core growth, immunization, and development surfaces beside a prominent
 * "Tambah anak" call to action so a first visit communicates what the tracker
 * does. The main experience is inline instead of modal-heavy.
 */
export default async function TrackerPage({ searchParams }: TrackerPageProps) {
  const session = await requireServerSession();
  const childrenResult = await fetchChildrenByOwner(session.userId);
  const { anak, modal } = await searchParams;

  const addChildCta = (
    <TrackerModalButton
      modalKey={TRACKER_MODAL.addChild}
      label={TRACKER_LIST_COPY.addCta}
    />
  );

  // The edit modal mutates a profile, so it must resolve to the exact child
  // named by `?anak=` — never a `[0]` fallback that could overwrite the wrong
  // child from a stale or foreign link.
  const editChild = childrenResult.ok
    ? resolveEditTarget(childrenResult.value, anak, modal)
    : null;

  // The currently-viewed child (mirrors TrackerChildSection's selection) — the
  // target for the "Tambah pengukuran" modal.
  const activeChild = childrenResult.ok
    ? (childrenResult.value.find((child) => child.id === anak) ??
      childrenResult.value[0] ??
      null)
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={TRACKER_LIST_COPY.eyebrow}
        title={TRACKER_LIST_COPY.title}
        description={TRACKER_LIST_COPY.description}
        actions={addChildCta}
      />

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

      {editChild ? <TrackerEditChildModal childId={editChild.id} /> : null}
      {modal === TRACKER_MODAL.addChild ? <TrackerAddChildModal /> : null}
      {activeChild && modal === TRACKER_MODAL.addMeasurement ? (
        <TrackerAddMeasurementModal childId={activeChild.id} />
      ) : null}

      <AiChatMount pageId="tracker" childId={activeChild?.id} />
    </div>
  );
}
