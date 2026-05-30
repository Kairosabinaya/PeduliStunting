import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NutritionTabs } from "@/components/features/tracker/nutrition-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import { NUTRITION_PAGE_COPY } from "@/config/tracker";
import { monthsBetween } from "@/domain/shared/age-months";
import { asDateOnly } from "@/domain/shared/date-only";
import { asChildId, isUuid } from "@/domain/shared/ids";
import {
  fetchChildById,
  fetchNutritionEventsByChild,
} from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { todayIso } from "@/lib/today";

interface NutritionPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export const metadata: Metadata = {
  title: NUTRITION_PAGE_COPY.metaTitleSuffix,
};

export const dynamic = "force-dynamic";

export default async function NutritionPage({ params }: NutritionPageProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  const session = await requireServerSession();
  const childResolved = asChildId(childId);
  const [childResult, eventsResult] = await Promise.all([
    fetchChildById(session.userId, childResolved),
    fetchNutritionEventsByChild(session.userId, childResolved),
  ]);

  if (!childResult.ok) {
    if (childResult.error.kind === "not_found") notFound();
    return (
      <ErrorState
        title={NUTRITION_PAGE_COPY.errorTitle}
        description={childResult.error.message}
      />
    );
  }
  if (!eventsResult.ok) {
    return (
      <ErrorState
        title={NUTRITION_PAGE_COPY.errorTitle}
        description={eventsResult.error.message}
      />
    );
  }

  const child = childResult.value;
  const events = eventsResult.value;
  const childAgeMonths = monthsBetween(
    asDateOnly(child.birthDate),
    asDateOnly(todayIso()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{NUTRITION_PAGE_COPY.title}</CardTitle>
        <CardDescription>{NUTRITION_PAGE_COPY.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <NutritionTabs
          childId={childId}
          childAgeMonths={childAgeMonths}
          events={events}
        />
      </CardContent>
    </Card>
  );
}
