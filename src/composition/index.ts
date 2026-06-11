/**
 * Composition root.
 *
 * The only place where concrete infrastructure implementations are wired to
 * domain ports. Presentation code resolves use cases via {@link makeUseCases}
 * (per-request, since the Supabase client is bound to request cookies) and
 * shared singletons via {@link getContainer}.
 */

import { SystemClock, type Clock } from "@/domain/shared/clock";
import { getLogger } from "@/infrastructure/logger/pino-logger";
import type { Logger } from "@/domain/shared/logger";

import type { TypedSupabaseClient } from "@/infrastructure/supabase/server-client";

import { SupabaseRegionRepository } from "@/infrastructure/supabase/region/supabase-region-repository";
import { SupabaseRegionIndicatorsRepository } from "@/infrastructure/supabase/region/supabase-region-indicators-repository";
import { SupabaseRegionBoundaryRepository } from "@/infrastructure/supabase/region/supabase-region-boundary-repository";
import { SupabaseIndicatorDictionaryRepository } from "@/infrastructure/supabase/region/supabase-indicator-dictionary-repository";
import { SupabaseModelMetadataRepository } from "@/infrastructure/supabase/model/supabase-model-metadata-repository";
import { SupabaseModelPredictionRepository } from "@/infrastructure/supabase/model/supabase-model-prediction-repository";
import { SupabaseLocalCoefficientRepository } from "@/infrastructure/supabase/model/supabase-local-coefficient-repository";
import { SupabaseLocalFitRepository } from "@/infrastructure/supabase/model/supabase-local-fit-repository";
import { SupabaseChildRepository } from "@/infrastructure/supabase/tracking/supabase-child-repository";
import { SupabaseGrowthMeasurementRepository } from "@/infrastructure/supabase/tracking/supabase-growth-measurement-repository";
import { SupabaseGrowthStandardRepository } from "@/infrastructure/supabase/tracking/supabase-growth-standard-repository";
import { SupabaseImmunizationRepository } from "@/infrastructure/supabase/health-plan/supabase-immunization-repository";
import { SupabaseChildImmunizationRepository } from "@/infrastructure/supabase/health-plan/supabase-child-immunization-repository";
import { SupabaseMilestoneRepository } from "@/infrastructure/supabase/health-plan/supabase-milestone-repository";
import { SupabaseChildMilestoneRepository } from "@/infrastructure/supabase/health-plan/supabase-child-milestone-repository";
import { SupabaseUserProfileRepository } from "@/infrastructure/supabase/account/supabase-user-profile-repository";
import { SupabaseAvatarStorage } from "@/infrastructure/supabase/account/supabase-avatar-storage";
import { SupabaseAdminAccountRepository } from "@/infrastructure/supabase/account/supabase-admin-account-repository";

import { ListRegionsUseCase } from "@/application/region/use-cases/list-regions";
import { GetRegionByKodeBpsUseCase } from "@/application/region/use-cases/get-region-by-kode-bps";
import { ListRegionIndicatorsByYearUseCase } from "@/application/region/use-cases/list-region-indicators-by-year";
import { GetRegionIndicatorsUseCase } from "@/application/region/use-cases/get-region-indicators";
import { ListRegionIndicatorsHistoryUseCase } from "@/application/region/use-cases/list-region-indicators-history";
import { ListRegionBoundariesUseCase } from "@/application/region/use-cases/list-region-boundaries";
import { ListIndicatorDictionaryUseCase } from "@/application/region/use-cases/list-indicator-dictionary";
import { ListModelMetadataUseCase } from "@/application/model/use-cases/list-model-metadata";
import { GetDefaultModelMetadataUseCase } from "@/application/model/use-cases/get-default-model-metadata";
import { ListPredictionsByYearUseCase } from "@/application/model/use-cases/list-predictions-by-year";
import { ListPredictionsByRegionUseCase } from "@/application/model/use-cases/list-predictions-by-region";
import { GetRegionFitUseCase } from "@/application/model/use-cases/get-region-fit";
import { ListFittedRegionYearsUseCase } from "@/application/model/use-cases/list-fitted-region-years";
import { GetDashboardInsightsUseCase } from "@/application/region/use-cases/get-dashboard-insights";
import { GetDashboardDatasetUseCase } from "@/application/region/use-cases/get-dashboard-dataset";
import { ListChildrenByOwnerUseCase } from "@/application/tracking/use-cases/list-children-by-owner";
import { GetChildByIdUseCase } from "@/application/tracking/use-cases/get-child-by-id";
import { CreateChildUseCase } from "@/application/tracking/use-cases/create-child";
import { UpdateChildUseCase } from "@/application/tracking/use-cases/update-child";
import { SoftDeleteChildUseCase } from "@/application/tracking/use-cases/soft-delete-child";
import { ListMeasurementsByChildUseCase } from "@/application/tracking/use-cases/list-measurements-by-child";
import { AddMeasurementUseCase } from "@/application/tracking/use-cases/add-measurement";
import { ComputeQuickScreeningUseCase } from "@/application/tracking/use-cases/compute-quick-screening";
import { ListImmunizationScheduleUseCase } from "@/application/health-plan/use-cases/list-immunization-schedule";
import { ListChildImmunizationsUseCase } from "@/application/health-plan/use-cases/list-child-immunizations";
import { UpsertChildImmunizationUseCase } from "@/application/health-plan/use-cases/upsert-child-immunization";
import { ListMilestonesUseCase } from "@/application/health-plan/use-cases/list-milestones";
import { ListChildMilestonesUseCase } from "@/application/health-plan/use-cases/list-child-milestones";
import { UpsertChildMilestoneUseCase } from "@/application/health-plan/use-cases/upsert-child-milestone";
import { GetCurrentProfileUseCase } from "@/application/account/use-cases/get-current-profile";
import { UpdateUserProfileUseCase } from "@/application/account/use-cases/update-user-profile";
import { UpdateUserAvatarUseCase } from "@/application/account/use-cases/update-user-avatar";
import { UploadPendingAvatarUseCase } from "@/application/account/use-cases/upload-pending-avatar";
import { ListAdminAccountsUseCase } from "@/application/account/use-cases/list-admin-accounts";
import { DeleteUserAccountUseCase } from "@/application/account/use-cases/delete-user-account";

export interface AppContainer {
  readonly clock: Clock;
  readonly logger: Logger;
}

let cached: AppContainer | undefined;

export function getContainer(): AppContainer {
  if (!cached) {
    cached = {
      clock: new SystemClock(),
      logger: getLogger(),
    };
  }
  return cached;
}

export interface UseCases {
  // region
  readonly listRegions: ListRegionsUseCase;
  readonly getRegionByKodeBps: GetRegionByKodeBpsUseCase;
  readonly listRegionIndicatorsByYear: ListRegionIndicatorsByYearUseCase;
  readonly getRegionIndicators: GetRegionIndicatorsUseCase;
  readonly listRegionIndicatorsHistory: ListRegionIndicatorsHistoryUseCase;
  readonly listRegionBoundaries: ListRegionBoundariesUseCase;
  readonly listIndicatorDictionary: ListIndicatorDictionaryUseCase;
  // model
  readonly listModelMetadata: ListModelMetadataUseCase;
  readonly getDefaultModelMetadata: GetDefaultModelMetadataUseCase;
  readonly listPredictionsByYear: ListPredictionsByYearUseCase;
  readonly listPredictionsByRegion: ListPredictionsByRegionUseCase;
  readonly getRegionFit: GetRegionFitUseCase;
  readonly listFittedRegionYears: ListFittedRegionYearsUseCase;
  readonly getDashboardInsights: GetDashboardInsightsUseCase;
  readonly getDashboardDataset: GetDashboardDatasetUseCase;
  // tracking
  readonly listChildrenByOwner: ListChildrenByOwnerUseCase;
  readonly getChildById: GetChildByIdUseCase;
  readonly createChild: CreateChildUseCase;
  readonly updateChild: UpdateChildUseCase;
  readonly softDeleteChild: SoftDeleteChildUseCase;
  readonly listMeasurementsByChild: ListMeasurementsByChildUseCase;
  readonly addMeasurement: AddMeasurementUseCase;
  readonly computeQuickScreening: ComputeQuickScreeningUseCase;
  // health-plan
  readonly listImmunizationSchedule: ListImmunizationScheduleUseCase;
  readonly listChildImmunizations: ListChildImmunizationsUseCase;
  readonly upsertChildImmunization: UpsertChildImmunizationUseCase;
  readonly listMilestones: ListMilestonesUseCase;
  readonly listChildMilestones: ListChildMilestonesUseCase;
  readonly upsertChildMilestone: UpsertChildMilestoneUseCase;
  // account
  readonly getCurrentProfile: GetCurrentProfileUseCase;
  readonly updateUserProfile: UpdateUserProfileUseCase;
  readonly updateUserAvatar: UpdateUserAvatarUseCase;
}

/**
 * Privileged use cases that require the service-role admin client. These
 * exist for paths where the user does not yet hold a session (e.g.
 * pre-verification avatar upload during sign-up). See ADR-0008 for the
 * justification of using service-role outside isolated admin paths.
 */
export interface AdminUseCases {
  readonly uploadPendingAvatar: UploadPendingAvatarUseCase;
  readonly listAdminAccounts: ListAdminAccountsUseCase;
  readonly deleteUserAccount: DeleteUserAccountUseCase;
}

/**
 * Build the per-request use case registry. Pass a typed Supabase client
 * obtained via `createSupabaseServerClient()` (Server Components, Server
 * Actions, Route Handlers) or `createSupabaseAdminClient()` (privileged
 * server-only paths). The Supabase client is request-scoped because cookies
 * bind it to the current session, so use cases are constructed per request
 * rather than cached as singletons.
 */
export function makeUseCases(client: TypedSupabaseClient): UseCases {
  const regionRepo = new SupabaseRegionRepository(client);
  const regionIndicatorsRepo = new SupabaseRegionIndicatorsRepository(client);
  const regionBoundaryRepo = new SupabaseRegionBoundaryRepository(client);
  const indicatorDictionaryRepo = new SupabaseIndicatorDictionaryRepository(
    client,
  );
  const modelMetadataRepo = new SupabaseModelMetadataRepository(client);
  const modelPredictionRepo = new SupabaseModelPredictionRepository(client);
  const localCoefficientRepo = new SupabaseLocalCoefficientRepository(client);
  const localFitRepo = new SupabaseLocalFitRepository(client);
  const childRepo = new SupabaseChildRepository(client);
  const measurementRepo = new SupabaseGrowthMeasurementRepository(client);
  const standardRepo = new SupabaseGrowthStandardRepository(client);
  const immunizationRepo = new SupabaseImmunizationRepository(client);
  const childImmunizationRepo = new SupabaseChildImmunizationRepository(client);
  const milestoneRepo = new SupabaseMilestoneRepository(client);
  const childMilestoneRepo = new SupabaseChildMilestoneRepository(client);
  const profileRepo = new SupabaseUserProfileRepository(client);
  const avatarStorage = new SupabaseAvatarStorage(client);

  return {
    listRegions: new ListRegionsUseCase(regionRepo),
    getRegionByKodeBps: new GetRegionByKodeBpsUseCase(regionRepo),
    listRegionIndicatorsByYear: new ListRegionIndicatorsByYearUseCase(
      regionIndicatorsRepo,
    ),
    getRegionIndicators: new GetRegionIndicatorsUseCase(regionIndicatorsRepo),
    listRegionIndicatorsHistory: new ListRegionIndicatorsHistoryUseCase(
      regionIndicatorsRepo,
    ),
    listRegionBoundaries: new ListRegionBoundariesUseCase(regionBoundaryRepo),
    listIndicatorDictionary: new ListIndicatorDictionaryUseCase(
      indicatorDictionaryRepo,
    ),
    listModelMetadata: new ListModelMetadataUseCase(modelMetadataRepo),
    getDefaultModelMetadata: new GetDefaultModelMetadataUseCase(
      modelMetadataRepo,
    ),
    listPredictionsByYear: new ListPredictionsByYearUseCase(
      modelPredictionRepo,
    ),
    listPredictionsByRegion: new ListPredictionsByRegionUseCase(
      modelPredictionRepo,
    ),
    getRegionFit: new GetRegionFitUseCase(
      localFitRepo,
      localCoefficientRepo,
      regionRepo,
      regionIndicatorsRepo,
      modelPredictionRepo,
    ),
    listFittedRegionYears: new ListFittedRegionYearsUseCase(localFitRepo),
    getDashboardInsights: new GetDashboardInsightsUseCase(
      regionRepo,
      regionIndicatorsRepo,
    ),
    getDashboardDataset: new GetDashboardDatasetUseCase(
      regionRepo,
      regionIndicatorsRepo,
      indicatorDictionaryRepo,
    ),
    listChildrenByOwner: new ListChildrenByOwnerUseCase(childRepo),
    getChildById: new GetChildByIdUseCase(childRepo),
    createChild: new CreateChildUseCase(childRepo),
    updateChild: new UpdateChildUseCase(childRepo),
    softDeleteChild: new SoftDeleteChildUseCase(childRepo),
    listMeasurementsByChild: new ListMeasurementsByChildUseCase(
      measurementRepo,
    ),
    addMeasurement: new AddMeasurementUseCase(
      childRepo,
      measurementRepo,
      standardRepo,
    ),
    computeQuickScreening: new ComputeQuickScreeningUseCase(standardRepo),
    listImmunizationSchedule: new ListImmunizationScheduleUseCase(
      immunizationRepo,
    ),
    listChildImmunizations: new ListChildImmunizationsUseCase(
      childImmunizationRepo,
    ),
    upsertChildImmunization: new UpsertChildImmunizationUseCase(
      childImmunizationRepo,
    ),
    listMilestones: new ListMilestonesUseCase(milestoneRepo),
    listChildMilestones: new ListChildMilestonesUseCase(childMilestoneRepo),
    upsertChildMilestone: new UpsertChildMilestoneUseCase(childMilestoneRepo),
    getCurrentProfile: new GetCurrentProfileUseCase(profileRepo),
    updateUserProfile: new UpdateUserProfileUseCase(profileRepo),
    updateUserAvatar: new UpdateUserAvatarUseCase(profileRepo, avatarStorage),
  };
}

/**
 * Build the privileged (service-role) use case registry. Pass a client
 * obtained via `createSupabaseAdminClient()` only. The factory exists in
 * a separate function so misuse — wiring the regular session-backed
 * client into a privileged action — is harder.
 */
export function makeAdminUseCases(
  adminClient: TypedSupabaseClient,
): AdminUseCases {
  const avatarStorage = new SupabaseAvatarStorage(adminClient);
  const adminAccountsRepo = new SupabaseAdminAccountRepository(adminClient);
  return {
    uploadPendingAvatar: new UploadPendingAvatarUseCase(avatarStorage),
    listAdminAccounts: new ListAdminAccountsUseCase(adminAccountsRepo),
    deleteUserAccount: new DeleteUserAccountUseCase(adminAccountsRepo),
  };
}
