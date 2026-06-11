import "server-only";

import { cache } from "react";

import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";
import type {
  ChildImmunizationDto,
  ChildMilestoneDto,
  ImmunizationDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import type { AppError } from "@/domain/errors/app-error";
import { ok, type Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import { asDateOnly } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import { todayIso } from "@/lib/today";
import {
  fetchChildById,
  fetchChildImmunizations,
  fetchChildMilestones,
  fetchImmunizationSchedule,
  fetchMeasurementsByChild,
  fetchMilestoneCatalog,
} from "@/lib/tracker-cache";

/**
 * Everything the child dashboard renders for one child: the profile, the
 * derived current age in completed months (the WHO LMS denominator), and the
 * four health-plan datasets. Reference datasets (immunization schedule,
 * milestone catalog) and the child's own status rows fall back to empty arrays
 * on a soft failure so a single missing catalog never blanks the whole
 * dashboard — only a child-not-found or a measurements error is fatal.
 */
export interface ChildOverviewData {
  readonly child: ChildDto;
  readonly childAgeMonths: number;
  readonly measurements: readonly GrowthMeasurementDto[];
  readonly immunizationSchedule: readonly ImmunizationDto[];
  readonly childImmunizations: readonly ChildImmunizationDto[];
  readonly milestoneCatalog: readonly MilestoneDto[];
  readonly childMilestones: readonly ChildMilestoneDto[];
}

/**
 * Load the full overview bundle for a single child. Shared by the `/tracker`
 * dashboard (selected child) and the `/tracker/anak/[childId]` drill-down so
 * both surfaces fetch identically. Wrapped in React `cache` to dedupe within a
 * render. Returns a {@link Result} so callers can map `not_found` to a 404 and
 * other errors to an `ErrorState`.
 */
export const loadChildOverview = cache(
  async (
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<ChildOverviewData, AppError>> => {
    const childResult = await fetchChildById(userId, childId);
    if (!childResult.ok) {
      return childResult;
    }

    const [
      measurementsResult,
      immunizationScheduleResult,
      childImmunizationsResult,
      milestoneCatalogResult,
      childMilestonesResult,
    ] = await Promise.all([
      fetchMeasurementsByChild(userId, childId),
      fetchImmunizationSchedule(),
      fetchChildImmunizations(userId, childId),
      fetchMilestoneCatalog(),
      fetchChildMilestones(userId, childId),
    ]);

    if (!measurementsResult.ok) {
      return measurementsResult;
    }

    const child = childResult.value;
    const childAgeMonths = monthsBetween(
      asDateOnly(child.birthDate),
      asDateOnly(todayIso()),
    );

    return ok({
      child,
      childAgeMonths,
      measurements: measurementsResult.value,
      immunizationSchedule: immunizationScheduleResult.ok
        ? immunizationScheduleResult.value
        : [],
      childImmunizations: childImmunizationsResult.ok
        ? childImmunizationsResult.value
        : [],
      milestoneCatalog: milestoneCatalogResult.ok
        ? milestoneCatalogResult.value
        : [],
      childMilestones: childMilestonesResult.ok
        ? childMilestonesResult.value
        : [],
    });
  },
);
