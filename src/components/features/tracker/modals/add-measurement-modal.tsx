import { MeasurementForm } from "@/components/features/tracker/measurement-form";
import { ErrorState } from "@/components/primitives/error-state";
import { MEASUREMENTS_COPY } from "@/config/tracker";
import { asChildId } from "@/domain/shared/ids";
import { fetchChildById } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { RoutedModal } from "./routed-modal";

export interface AddMeasurementModalProps {
  readonly childId: string;
}

export async function AddMeasurementModal({
  childId,
}: AddMeasurementModalProps) {
  const session = await requireServerSession();
  const childResult = await fetchChildById(session.userId, asChildId(childId));
  if (!childResult.ok) {
    return (
      <RoutedModal childId={childId} title={MEASUREMENTS_COPY.addCardTitle}>
        <ErrorState
          title={MEASUREMENTS_COPY.errorTitle}
          description={childResult.error.message}
        />
      </RoutedModal>
    );
  }

  return (
    <RoutedModal
      childId={childId}
      title={MEASUREMENTS_COPY.addCardTitle}
      description={MEASUREMENTS_COPY.addCardDescription}
    >
      <MeasurementForm
        childId={childId}
        childBirthDate={childResult.value.birthDate}
      />
    </RoutedModal>
  );
}
