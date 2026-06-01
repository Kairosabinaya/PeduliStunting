import type { ChildDto } from "@/application/tracking/dtos";
import { ErrorState } from "@/components/primitives/error-state";
import { TRACKER_LIST_COPY } from "@/config/tracker";
import { asChildId, type UserId } from "@/domain/shared/ids";
import { loadChildOverview } from "@/lib/child-overview";

import { ChildDashboard } from "./child-dashboard";
import { ChildDetailHeader } from "./child-detail-header";
import { ChildSwitcher } from "./child-switcher";

export interface TrackerChildSectionProps {
  /** The account's children. Must be non-empty (the page handles the empty case). */
  readonly childProfiles: readonly ChildDto[];
  readonly userId: UserId;
  /** The `?anak=` selection, if any. Falls back to the first child. */
  readonly requestedChildId?: string | undefined;
}

/**
 * The populated `/tracker` body: a child switcher (only when more than one
 * child exists), the selected child's header, and the full {@link ChildDashboard}
 * inline. Selection is URL-driven via `?anak=`; an unknown or missing id falls
 * back to the first child so the dashboard is never blank when children exist.
 */
export async function TrackerChildSection({
  childProfiles,
  userId,
  requestedChildId,
}: TrackerChildSectionProps) {
  const selected =
    childProfiles.find((child) => child.id === requestedChildId) ??
    childProfiles[0];

  if (!selected) {
    return (
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={TRACKER_LIST_COPY.errorDescriptionFallback}
      />
    );
  }

  const overview = await loadChildOverview(userId, asChildId(selected.id));
  if (!overview.ok) {
    return (
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={
          overview.error.message || TRACKER_LIST_COPY.errorDescriptionFallback
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {childProfiles.length > 1 ? (
        <ChildSwitcher childProfiles={childProfiles} selectedId={selected.id} />
      ) : null}
      <ChildDetailHeader child={selected} showBackLink={false} />
      <ChildDashboard data={overview.value} />
    </div>
  );
}
