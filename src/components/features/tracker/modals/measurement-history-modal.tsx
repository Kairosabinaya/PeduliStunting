import { ErrorState } from "@/components/primitives/error-state";
import { MeasurementHistory } from "@/components/features/tracker/measurement-history";
import { MEASUREMENTS_COPY } from "@/config/tracker";
import { asChildId } from "@/domain/shared/ids";
import { fetchMeasurementsByChild } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { RoutedModal } from "./routed-modal";

export interface MeasurementHistoryModalProps {
  readonly childId: string;
}

export async function MeasurementHistoryModal({
  childId,
}: MeasurementHistoryModalProps) {
  const session = await requireServerSession();
  const measurements = await fetchMeasurementsByChild(
    session.userId,
    asChildId(childId),
  );

  return (
    <RoutedModal
      childId={childId}
      title={MEASUREMENTS_COPY.historyTitle}
      description={MEASUREMENTS_COPY.historyDescription}
      variant="wide"
    >
      {measurements.ok ? (
        <MeasurementHistory measurements={measurements.value} />
      ) : (
        <ErrorState
          title={MEASUREMENTS_COPY.errorTitle}
          description={measurements.error.message}
        />
      )}
    </RoutedModal>
  );
}
