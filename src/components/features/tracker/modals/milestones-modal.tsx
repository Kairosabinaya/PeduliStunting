import { ErrorState } from "@/components/primitives/error-state";
import { MilestoneAlertBanner } from "@/components/features/tracker/milestone-alert-banner";
import { MilestoneChecklist } from "@/components/features/tracker/milestone-checklist";
import { MILESTONE_COPY } from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asDateOnly } from "@/domain/shared/date-only";
import { computeMilestoneAlert } from "@/domain/health-plan/services/milestone-status";
import { asChildId } from "@/domain/shared/ids";
import {
  fetchChildById,
  fetchChildMilestones,
  fetchMilestoneCatalog,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";
import { RoutedModal } from "./routed-modal";

export interface MilestonesModalProps {
  readonly childId: string;
}

export async function MilestonesModal({ childId }: MilestonesModalProps) {
  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, catalogResult, recordsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchMilestoneCatalog(),
    fetchChildMilestones(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    return (
      <RoutedModal childId={childId} title={MILESTONE_COPY.metaTitleSuffix}>
        <ErrorState
          title={MILESTONE_COPY.errorTitle}
          description={childResult.error.message}
        />
      </RoutedModal>
    );
  }
  if (!catalogResult.ok) {
    return (
      <RoutedModal childId={childId} title={MILESTONE_COPY.metaTitleSuffix}>
        <ErrorState
          title={MILESTONE_COPY.errorTitle}
          description={catalogResult.error.message}
        />
      </RoutedModal>
    );
  }
  if (!recordsResult.ok) {
    return (
      <RoutedModal childId={childId} title={MILESTONE_COPY.metaTitleSuffix}>
        <ErrorState
          title={MILESTONE_COPY.errorTitle}
          description={recordsResult.error.message}
        />
      </RoutedModal>
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
    <RoutedModal
      childId={childId}
      title={MILESTONE_COPY.metaTitleSuffix}
      variant="wide"
    >
      <div className="space-y-5">
        {alert.shouldAlert ? (
          <MilestoneAlertBanner delayedCount={alert.delayedCount} />
        ) : null}
        <MilestoneChecklist
          childId={childId}
          childBirthDate={child.birthDate}
          childAgeMonths={childAgeMonths}
          catalog={catalog}
          records={records}
        />
      </div>
    </RoutedModal>
  );
}
