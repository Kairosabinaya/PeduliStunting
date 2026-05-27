import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { ModelPrediction } from "@/domain/model/entities/model-prediction";
import type { ModelPredictionRepository } from "@/domain/model/ports/model-prediction-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { asYear, type Year } from "@/domain/region/value-objects/year";
import { mapModelPredictionRow } from "@/schemas/model";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, model_version, kode_bps, tahun, predicted_category, prob_rendah, prob_sedang, prob_tinggi, created_at, updated_at";

export class SupabaseModelPredictionRepository
  implements ModelPredictionRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByVersionAndYear(
    version: ModelVersion,
    tahun: Year,
  ): Promise<Result<readonly ModelPrediction[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_predictions")
        .select(SELECT_COLUMNS)
        .eq("model_version", version)
        .eq("tahun", tahun);
      if (error) return err(mapPostgrestError(error, "model_predictions"));

      const out: ModelPrediction[] = [];
      for (const row of data ?? []) {
        const mapped = mapModelPredictionRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_predictions.listByVersionAndYear",
        ),
      );
    }
  }

  async findByVersionAndRegion(
    version: ModelVersion,
    kodeBps: KodeBps,
  ): Promise<Result<readonly ModelPrediction[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_predictions")
        .select(SELECT_COLUMNS)
        .eq("model_version", version)
        .eq("kode_bps", kodeBps)
        .order("tahun", { ascending: true });
      if (error) return err(mapPostgrestError(error, "model_predictions"));

      const out: ModelPrediction[] = [];
      for (const row of data ?? []) {
        const mapped = mapModelPredictionRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_predictions.findByVersionAndRegion",
        ),
      );
    }
  }

  async findOne(
    version: ModelVersion,
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<ModelPrediction | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_predictions")
        .select(SELECT_COLUMNS)
        .eq("model_version", version)
        .eq("kode_bps", kodeBps)
        .eq("tahun", tahun)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "model_predictions"));
      if (data === null) return ok(null);
      const mapped = mapModelPredictionRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "model_predictions.findOne"),
      );
    }
  }

  async listAvailableYears(
    version: ModelVersion,
  ): Promise<Result<readonly Year[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_predictions")
        .select("tahun")
        .eq("model_version", version)
        .order("tahun", { ascending: true });
      if (error) return err(mapPostgrestError(error, "model_predictions"));

      const seen = new Set<number>();
      const out: Year[] = [];
      for (const row of data ?? []) {
        if (seen.has(row.tahun)) continue;
        seen.add(row.tahun);
        out.push(asYear(row.tahun));
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_predictions.listAvailableYears",
        ),
      );
    }
  }
}
