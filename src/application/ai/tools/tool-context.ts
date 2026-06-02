/**
 * Dependencies the AI tools need, declared as STRUCTURAL method-signature
 * interfaces (not concrete use-case classes). This keeps the application layer
 * free of the composition root AND lets tests inject plain-object fakes (the
 * real use-case classes have private fields, so they are nominal and cannot be
 * faked directly). The composition's `UseCases` registry satisfies these
 * structurally, so it can be passed as-is.
 */

import type { ChildOverviewLoader } from "@/application/ai/ports/child-overview-loader";
import type {
  ModelMetadataDto,
  ModelPredictionDto,
} from "@/application/model/dtos";
import type { RegionDto, RegionIndicatorsDto } from "@/application/region/dtos";
import type { AppError } from "@/domain/errors/app-error";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import type { ModelVersion, UserId } from "@/domain/shared/ids";
import type { Logger } from "@/domain/shared/logger";
import type { Result } from "@/domain/shared/result";

export interface AiToolUseCases {
  readonly listRegions: {
    execute(): Promise<Result<readonly RegionDto[], AppError>>;
  };
  readonly getRegionByKodeBps: {
    execute(kodeBps: KodeBps): Promise<Result<RegionDto | null, AppError>>;
  };
  readonly listRegionIndicatorsByYear: {
    execute(
      tahun: Year,
    ): Promise<Result<readonly RegionIndicatorsDto[], AppError>>;
  };
  readonly listRegionIndicatorsHistory: {
    execute(
      kodeBps: KodeBps,
    ): Promise<Result<readonly RegionIndicatorsDto[], AppError>>;
  };
  readonly getDefaultModelMetadata: {
    execute(): Promise<Result<ModelMetadataDto | null, AppError>>;
  };
  readonly listPredictionsByRegion: {
    execute(
      version: ModelVersion,
      kodeBps: KodeBps,
    ): Promise<Result<readonly ModelPredictionDto[], AppError>>;
  };
}

/** Minimal session shape a tracker tool needs (just the owner id). */
export interface AiToolSession {
  readonly userId: UserId;
}

/** Context for region/model tools (public pages). */
export interface AiToolContext {
  readonly useCases: AiToolUseCases;
  readonly logger: Logger;
}

/** Context for tracker tools (authenticated). */
export interface TrackerToolContext {
  readonly session: AiToolSession;
  readonly loadChildOverview: ChildOverviewLoader;
  readonly logger: Logger;
}
