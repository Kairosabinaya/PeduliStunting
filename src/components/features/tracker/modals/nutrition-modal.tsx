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
import { RoutedModal } from "./routed-modal";

export interface NutritionModalProps {
  readonly childId: string;
}

export async function NutritionModal({ childId }: NutritionModalProps) {
  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, eventsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchNutritionEventsByChild(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    return (
      <RoutedModal
        childId={childId}
        title={NUTRITION_PAGE_COPY.metaTitleSuffix}
      >
        <ErrorState
          title={NUTRITION_PAGE_COPY.errorTitle}
          description={childResult.error.message}
        />
      </RoutedModal>
    );
  }
  if (!eventsResult.ok) {
    return (
      <RoutedModal
        childId={childId}
        title={NUTRITION_PAGE_COPY.metaTitleSuffix}
      >
        <ErrorState
          title={NUTRITION_PAGE_COPY.errorTitle}
          description={eventsResult.error.message}
        />
      </RoutedModal>
    );
  }

  const child = childResult.value;
  const events = eventsResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.birthDate),
    asDateOnly(todayIso()),
  );

  return (
    <RoutedModal
      childId={childId}
      title={NUTRITION_PAGE_COPY.title}
      description={NUTRITION_PAGE_COPY.description}
      variant="wide"
    >
      <NutritionTabs
        childId={childId}
        childAgeMonths={childAgeMonths}
        events={events}
      />
    </RoutedModal>
  );
}
