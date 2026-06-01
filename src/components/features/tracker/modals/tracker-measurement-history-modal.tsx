import { ErrorState } from "@/components/primitives/error-state";
import { MeasurementHistory } from "@/components/features/tracker/measurement-history";
import { MEASUREMENTS_COPY } from "@/config/tracker";
import { asChildId } from "@/domain/shared/ids";
import { fetchMeasurementsByChild } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { TrackerModal } from "./tracker-modal";

export interface TrackerMeasurementHistoryModalProps {
  readonly childId: string;
}

export async function TrackerMeasurementHistoryModal({
  childId,
}: TrackerMeasurementHistoryModalProps) {
  const session = await requireServerSession();
  const result = await fetchMeasurementsByChild(
    session.userId,
    asChildId(childId),
  );

  if (!result.ok) {
    return (
      <TrackerModal title={MEASUREMENTS_COPY.historyTitle}>
        <ErrorState
          title={MEASUREMENTS_COPY.errorTitle}
          description={result.error.message}
        />
      </TrackerModal>
    );
  }

  return (
    <TrackerModal title={MEASUREMENTS_COPY.historyTitle} variant="sheet">
      <MeasurementHistory measurements={result.value} />
    </TrackerModal>
  );
}
