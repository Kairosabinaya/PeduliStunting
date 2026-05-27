import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { ModelMetadata } from "@/domain/model/entities/model-metadata";
import type { ModelMetadataRepository } from "@/domain/model/ports/model-metadata-repository";
import { mapModelMetadataRow } from "@/schemas/model";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "version, name, hyperparameters, metrics, moran_per_year, notes, is_default, created_at, updated_at";

export class SupabaseModelMetadataRepository
  implements ModelMetadataRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Result<readonly ModelMetadata[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_metadata")
        .select(SELECT_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) return err(mapPostgrestError(error, "model_metadata"));

      const out: ModelMetadata[] = [];
      for (const row of data ?? []) {
        const mapped = mapModelMetadataRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "model_metadata.list"),
      );
    }
  }

  async findByVersion(
    version: ModelVersion,
  ): Promise<Result<ModelMetadata | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_metadata")
        .select(SELECT_COLUMNS)
        .eq("version", version)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "model_metadata"));
      if (data === null) return ok(null);
      const mapped = mapModelMetadataRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "model_metadata.findByVersion"),
      );
    }
  }

  async findDefault(): Promise<Result<ModelMetadata | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_metadata")
        .select(SELECT_COLUMNS)
        .eq("is_default", true)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "model_metadata"));
      if (data === null) return ok(null);
      const mapped = mapModelMetadataRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "model_metadata.findDefault"),
      );
    }
  }
}
