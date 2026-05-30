import {
  trackerChildImmunizationsRoute,
  trackerChildMeasurementsRoute,
  trackerChildMilestonesRoute,
  trackerChildNutritionRoute,
} from "@/config/tracker";
import type { ChildOverviewData } from "@/lib/child-overview";

import { ChildSummary } from "./child-summary";
import { GrowthChartCard } from "./growth-chart-card";
import { ModuleGrid } from "./module-grid";

export interface ChildDashboardProps {
  readonly data: ChildOverviewData;
}

/**
 * Full overview body for one child: latest-measurement summary, the four
 * domain module cards (Pertumbuhan, Imunisasi, Perkembangan, Gizi), and the
 * WHO growth curve. Rendered both on the `/tracker` dashboard (for the
 * selected child) and on the `/tracker/anak/[childId]` drill-down, so a mother
 * sees the same complete picture whether she opened a child or just landed on
 * the tracker. The page above supplies the header/child switcher.
 *
 * @example
 * ```tsx
 * const overview = await loadChildOverview(userId, childId);
 * if (overview.ok) return <ChildDashboard data={overview.value} />;
 * ```
 */
export function ChildDashboard({ data }: ChildDashboardProps) {
  const {
    child,
    childAgeMonths,
    measurements,
    immunizationSchedule,
    childImmunizations,
    milestoneCatalog,
    childMilestones,
    nutritionEvents,
  } = data;

  return (
    <div className="space-y-6">
      <ChildSummary measurements={measurements} />
      <ModuleGrid
        childAgeMonths={childAgeMonths}
        childDetailRoutes={{
          measurements: trackerChildMeasurementsRoute(child.id),
          immunizations: trackerChildImmunizationsRoute(child.id),
          milestones: trackerChildMilestonesRoute(child.id),
          nutrition: trackerChildNutritionRoute(child.id),
        }}
        measurements={measurements}
        immunizationSchedule={immunizationSchedule}
        childImmunizations={childImmunizations}
        milestoneCatalog={milestoneCatalog}
        childMilestones={childMilestones}
        nutritionEvents={nutritionEvents}
      />
      <GrowthChartCard child={child} measurements={measurements} />
    </div>
  );
}
