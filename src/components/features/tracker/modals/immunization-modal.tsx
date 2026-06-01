import { ErrorState } from "@/components/primitives/error-state";
import { ImmunizationTimeline } from "@/components/features/tracker/immunization-timeline";
import { IMMUNIZATION_COPY } from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asDateOnly } from "@/domain/shared/date-only";
import { asChildId } from "@/domain/shared/ids";
import {
  fetchChildById,
  fetchChildImmunizations,
  fetchImmunizationSchedule,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";
import { RoutedModal } from "./routed-modal";

export interface ImmunizationModalProps {
  readonly childId: string;
}

export async function ImmunizationModal({ childId }: ImmunizationModalProps) {
  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, scheduleResult, recordsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchImmunizationSchedule(),
    fetchChildImmunizations(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    return (
      <RoutedModal childId={childId} title={IMMUNIZATION_COPY.metaTitleSuffix}>
        <ErrorState
          title={IMMUNIZATION_COPY.errorTitle}
          description={childResult.error.message}
        />
      </RoutedModal>
    );
  }
  if (!scheduleResult.ok) {
    return (
      <RoutedModal childId={childId} title={IMMUNIZATION_COPY.metaTitleSuffix}>
        <ErrorState
          title={IMMUNIZATION_COPY.errorTitle}
          description={scheduleResult.error.message}
        />
      </RoutedModal>
    );
  }
  if (!recordsResult.ok) {
    return (
      <RoutedModal childId={childId} title={IMMUNIZATION_COPY.metaTitleSuffix}>
        <ErrorState
          title={IMMUNIZATION_COPY.errorTitle}
          description={recordsResult.error.message}
        />
      </RoutedModal>
    );
  }

  const schedule = scheduleResult.value;
  const records = recordsResult.value;
  const child = childResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.birthDate),
    asDateOnly(todayIso()),
  );

  return (
    <RoutedModal
      childId={childId}
      title={IMMUNIZATION_COPY.metaTitleSuffix}
      variant="wide"
    >
      <ImmunizationTimeline
        childId={childId}
        childBirthDate={child.birthDate}
        childAgeMonths={childAgeMonths}
        schedule={schedule}
        records={records}
      />
    </RoutedModal>
  );
}
