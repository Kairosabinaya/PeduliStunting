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
  NutritionEventDto,
} from "@/application/health-plan/dtos";
import type {
  PregnancyDto,
  PregnancyEventDto,
} from "@/application/pregnancy/dtos";
import { makeUseCases } from "@/composition";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ChildId, PregnancyId, UserId } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

/**
 * Cache tag for the children list belonging to a user. Mutators that change
 * the list (createChild, softDelete) call `revalidateTag(childrenTag(userId))`.
 */
export function childrenTag(userId: string): string {
  return `user:${userId}:children`;
}

/** Cache tag for a single child's profile snapshot. */
export function childTag(childId: string): string {
  return `child:${childId}`;
}

/** Cache tag for the measurement history of a single child. */
export function measurementsTag(childId: string): string {
  return `child:${childId}:measurements`;
}

/** Cache tag for the immunization status rows of a single child. */
export function immunizationsTag(childId: string): string {
  return `child:${childId}:immunizations`;
}

/** Cache tag for the milestone status rows of a single child. */
export function milestonesTag(childId: string): string {
  return `child:${childId}:milestones`;
}

/** Cache tag for the nutrition events of a single child. */
export function nutritionEventsTag(childId: string): string {
  return `child:${childId}:nutrition-events`;
}

/** Cache tag for the user's active pregnancy snapshot. */
export function pregnancyTag(userId: string): string {
  return `user:${userId}:pregnancy`;
}

/** Cache tag for the events of a single pregnancy. */
export function pregnancyEventsTag(pregnancyId: string): string {
  return `pregnancy:${pregnancyId}:events`;
}

/** Cache tag for the public immunization schedule catalog. */
export const IMMUNIZATION_SCHEDULE_TAG = "catalog:immunization-schedule";

/** Cache tag for the public milestone catalog (SDIDTK). */
export const MILESTONE_CATALOG_TAG = "catalog:milestones";

/**
 * Per-request memoised list of children owned by the current user. React's
 * `cache` deduplicates calls within a single Server-Component render so the
 * list page and the layout shell only hit Supabase once.
 */
export const fetchChildrenByOwner = cache(
  async (userId: UserId): Promise<Result<readonly ChildDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listChildrenByOwner.execute(userId);
  },
);

/** Per-request memoised fetch of a single child's profile. */
export const fetchChildById = cache(
  async (
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<ChildDto, AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).getChildById.execute(userId, childId);
  },
);

/** Per-request memoised fetch of a child's growth measurements. */
export const fetchMeasurementsByChild = cache(
  async (
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly GrowthMeasurementDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listMeasurementsByChild.execute(
      userId,
      childId,
    );
  },
);

/** Per-request memoised fetch of the public immunization schedule. */
export const fetchImmunizationSchedule = cache(
  async (): Promise<Result<readonly ImmunizationDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listImmunizationSchedule.execute();
  },
);

/** Per-request memoised fetch of a child's immunization status rows. */
export const fetchChildImmunizations = cache(
  async (
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildImmunizationDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listChildImmunizations.execute(
      userId,
      childId,
    );
  },
);

/** Per-request memoised fetch of the public milestone catalog (SDIDTK). */
export const fetchMilestoneCatalog = cache(
  async (): Promise<Result<readonly MilestoneDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listMilestones.execute();
  },
);

/** Per-request memoised fetch of a child's milestone status rows. */
export const fetchChildMilestones = cache(
  async (
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildMilestoneDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listChildMilestones.execute(userId, childId);
  },
);

/** Per-request memoised fetch of a child's nutrition events (Phase 5). */
export const fetchNutritionEventsByChild = cache(
  async (
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly NutritionEventDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listNutritionEventsByChild.execute(
      userId,
      childId,
    );
  },
);

/** Per-request memoised fetch of the user's active pregnancy (Phase 6). */
export const fetchActivePregnancy = cache(
  async (userId: UserId): Promise<Result<PregnancyDto | null, AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).getActivePregnancy.execute(userId);
  },
);

/** Per-request memoised fetch of a pregnancy's events (Phase 6). */
export const fetchPregnancyEvents = cache(
  async (
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<readonly PregnancyEventDto[], AppError>> => {
    const supabase = await createSupabaseServerClient();
    return makeUseCases(supabase).listPregnancyEvents.execute(
      userId,
      pregnancyId,
    );
  },
);
