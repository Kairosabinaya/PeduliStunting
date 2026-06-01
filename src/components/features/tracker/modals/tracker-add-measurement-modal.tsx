import { MeasurementForm } from "@/components/features/tracker/measurement-form";
import { ErrorState } from "@/components/primitives/error-state";
import { MEASUREMENTS_COPY } from "@/config/tracker";
import { asChildId } from "@/domain/shared/ids";
import { fetchChildById } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { TrackerModal } from "./tracker-modal";

export interface TrackerAddMeasurementModalProps {
  readonly childId: string;
}

export async function TrackerAddMeasurementModal({
  childId,
}: TrackerAddMeasurementModalProps) {
  const session = await requireServerSession();
  const childResult = await fetchChildById(session.userId, asChildId(childId));
  if (!childResult.ok) {
    return (
      <TrackerModal title={MEASUREMENTS_COPY.addCardTitle}>
        <ErrorState
          title={MEASUREMENTS_COPY.errorTitle}
          description={childResult.error.message}
        />
      </TrackerModal>
    );
  }

  return (
    <TrackerModal
      title={MEASUREMENTS_COPY.addCardTitle}
      description={MEASUREMENTS_COPY.addCardDescription}
    >
      <MeasurementForm
        childId={childId}
        childBirthDate={childResult.value.birthDate}
      />
    </TrackerModal>
  );
}
