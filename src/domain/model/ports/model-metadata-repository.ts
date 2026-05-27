import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ModelVersion } from "@/domain/shared/ids";
import type { ModelMetadata } from "../entities/model-metadata";

export interface ModelMetadataRepository {
  list(): Promise<Result<readonly ModelMetadata[], AppError>>;
  findByVersion(
    version: ModelVersion,
  ): Promise<Result<ModelMetadata | null, AppError>>;
  findDefault(): Promise<Result<ModelMetadata | null, AppError>>;
}
