import { ErrorState } from "@/components/primitives/error-state";
import { NutritionTabs } from "@/components/features/tracker/nutrition-tabs";
import { NUTRITION_PAGE_COPY } from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asDateOnly } from "@/domain/shared/date-only";
import { asChildId } from "@/domain/shared/ids";
import {
  fetchChildById,
  fetchNutritionEventsByChild,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";
import { TrackerModal } from "./tracker-modal";

export interface TrackerNutritionModalProps {
  readonly childId: string;
}

export async function TrackerNutritionModal({
  childId,
}: TrackerNutritionModalProps) {
  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, eventsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchNutritionEventsByChild(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    return (
      <TrackerModal title={NUTRITION_PAGE_COPY.metaTitleSuffix}>
        <ErrorState
          title={NUTRITION_PAGE_COPY.errorTitle}
          description={childResult.error.message}
        />
      </TrackerModal>
    );
  }
  if (!eventsResult.ok) {
    return (
      <TrackerModal title={NUTRITION_PAGE_COPY.metaTitleSuffix}>
        <ErrorState
          title={NUTRITION_PAGE_COPY.errorTitle}
          description={eventsResult.error.message}
        />
      </TrackerModal>
    );
  }

  const child = childResult.value;
  const events = eventsResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.birthDate),
    asDateOnly(todayIso()),
  );

  return (
    <TrackerModal
      title={NUTRITION_PAGE_COPY.title}
      description={NUTRITION_PAGE_COPY.description}
      variant="sheet"
    >
      <NutritionTabs
        childId={childId}
        childAgeMonths={childAgeMonths}
        events={events}
      />
    </TrackerModal>
  );
}
