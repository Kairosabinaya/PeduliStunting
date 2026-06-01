import { Badge } from "@/components/primitives/badge";
import { MODULE_CARD_COPY, SD_CLASS_DISPLAY } from "@/config/tracker";
import type { ChildImmunizationDto } from "@/application/health-plan/dtos";
import type { ChildMilestoneDto } from "@/application/health-plan/dtos";
import type { ImmunizationDto } from "@/application/health-plan/dtos";
import type { MilestoneDto } from "@/application/health-plan/dtos";
import type { NutritionEventDto } from "@/application/health-plan/dtos";
import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

import { ModuleCard } from "./module-card";

export interface ModuleGridRoutedProps {
  readonly childAgeMonths: number;
  readonly childDetailRoutes: {
    readonly measurements: string;
    readonly immunizations: string;
    readonly milestones: string;
    readonly nutrition: string;
  };
  readonly measurements: readonly GrowthMeasurementDto[];
  readonly immunizationSchedule: readonly ImmunizationDto[];
  readonly childImmunizations: readonly ChildImmunizationDto[];
  readonly milestoneCatalog: readonly MilestoneDto[];
  readonly childMilestones: readonly ChildMilestoneDto[];
  readonly nutritionEvents: readonly NutritionEventDto[];
}

/**
 * Renders the four-card dashboard grid (Pertumbuhan, Imunisasi, Perkembangan,
 * Gizi) on `/tracker/anak/[childId]`. Each card navigates to a separate route.
 * The Gizi card is a Phase 5 placeholder.
 */
export function ModuleGridRouted({
  childAgeMonths,
  childDetailRoutes,
  measurements,
  immunizationSchedule,
  childImmunizations,
  milestoneCatalog,
  childMilestones,
  nutritionEvents,
}: ModuleGridRoutedProps) {
  const growth = resolveGrowth(measurements);
  const immunization = resolveImmunization(
    childAgeMonths,
    immunizationSchedule,
    childImmunizations,
  );
  const milestone = resolveMilestone(
    childAgeMonths,
    milestoneCatalog,
    childMilestones,
  );
  const nutritionStatus =
    nutritionEvents.length === 0
      ? MODULE_CARD_COPY.nutrition.emptyStatus
      : MODULE_CARD_COPY.nutrition.statusFormat(nutritionEvents.length);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ModuleCard
        title={MODULE_CARD_COPY.growth.title}
        description={MODULE_CARD_COPY.growth.description}
        statusLine={growth.statusLine}
        statusBadge={growth.badge}
        tone="growth"
        cta={{
          label: MODULE_CARD_COPY.growth.cta,
          href: childDetailRoutes.measurements,
        }}
      />
      <ModuleCard
        title={MODULE_CARD_COPY.immunization.title}
        description={MODULE_CARD_COPY.immunization.description}
        statusLine={immunization.statusLine}
        progressValue={immunization.progressValue}
        progressTotal={immunization.progressTotal}
        tone="immunization"
        cta={{
          label: MODULE_CARD_COPY.immunization.cta,
          href: childDetailRoutes.immunizations,
        }}
      />
      <ModuleCard
        title={MODULE_CARD_COPY.milestone.title}
        description={MODULE_CARD_COPY.milestone.description}
        statusLine={milestone.statusLine}
        progressValue={milestone.progressValue}
        progressTotal={milestone.progressTotal}
        tone="milestone"
        cta={{
          label: MODULE_CARD_COPY.milestone.cta,
          href: childDetailRoutes.milestones,
        }}
      />
      <ModuleCard
        title={MODULE_CARD_COPY.nutrition.title}
        description={MODULE_CARD_COPY.nutrition.description}
        statusLine={nutritionStatus}
        progressValue={
          nutritionEvents.length > 0 ? nutritionEvents.length : undefined
        }
        progressTotal={4} // Total of 4 nutrition aspects
        tone="nutrition"
        cta={{
          label: MODULE_CARD_COPY.nutrition.cta,
          href: childDetailRoutes.nutrition,
        }}
      />
    </div>
  );
}

interface GrowthSummary {
  readonly statusLine: string;
  readonly badge: React.ReactNode | undefined;
}

function resolveGrowth(
  measurements: readonly GrowthMeasurementDto[],
): GrowthSummary {
  const withTbU = measurements.find((m) => m.sdClass["TB_U"] !== undefined);
  if (!withTbU) {
    return {
      statusLine: MODULE_CARD_COPY.growth.emptyStatus,
      badge: undefined,
    };
  }
  const sdClass = withTbU.sdClass["TB_U"] as SdClass | undefined;
  if (!sdClass) {
    return {
      statusLine: MODULE_CARD_COPY.growth.emptyStatus,
      badge: undefined,
    };
  }
  const display = SD_CLASS_DISPLAY[sdClass];
  return {
    statusLine: `TB/U terakhir: ${display.label}`,
    badge: <Badge tone={display.tone}>{display.label}</Badge>,
  };
}

function resolveImmunization(
  childAgeMonths: number,
  schedule: readonly ImmunizationDto[],
  records: readonly ChildImmunizationDto[],
): { statusLine: string; progressValue?: number; progressTotal?: number } {
  const dueScheduleCount = schedule.filter(
    (entry) =>
      entry.recommendedAgeMonths !== null &&
      entry.recommendedAgeMonths <= childAgeMonths,
  ).length;
  const total = dueScheduleCount === 0 ? schedule.length : dueScheduleCount;
  const done = records.filter((record) => record.status === "done").length;
  if (total === 0) {
    return { statusLine: MODULE_CARD_COPY.immunization.emptyStatus };
  }
  return {
    statusLine: MODULE_CARD_COPY.immunization.statusFormat(done, total),
    progressValue: done,
    progressTotal: total,
  };
}

function resolveMilestone(
  childAgeMonths: number,
  catalog: readonly MilestoneDto[],
  records: readonly ChildMilestoneDto[],
): { statusLine: string; progressValue?: number; progressTotal?: number } {
  const relevantCatalog = catalog.filter(
    (item) =>
      item.minAgeMonths <= childAgeMonths &&
      item.maxAgeMonths >= childAgeMonths,
  );
  const total = relevantCatalog.length;
  if (total === 0) {
    return { statusLine: MODULE_CARD_COPY.milestone.emptyStatus };
  }
  const relevantIds = new Set(relevantCatalog.map((m) => m.id));
  const achieved = records.filter(
    (record) =>
      record.status === "achieved" && relevantIds.has(record.milestoneId),
  ).length;
  return {
    statusLine: MODULE_CARD_COPY.milestone.statusFormat(achieved, total),
    progressValue: achieved,
    progressTotal: total,
  };
}
