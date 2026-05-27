import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { LocalCoefficient } from "@/domain/model/entities/local-coefficient";
import type { LocalCoefficientRepository } from "@/domain/model/ports/local-coefficient-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import { mapModelCoefficientRow } from "@/schemas/model";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, model_version, kode_bps, tahun, predictor_code, coefficient, se, is_inference, created_at, updated_at";

export class SupabaseLocalCoefficientRepository
  implements LocalCoefficientRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByRegionAndYear(
    version: ModelVersion,
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<readonly LocalCoefficient[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_coefficients")
        .select(SELECT_COLUMNS)
        .eq("model_version", version)
        .eq("kode_bps", kodeBps)
        .eq("tahun", tahun)
        .order("predictor_code", { ascending: true });
      if (error) return err(mapPostgrestError(error, "model_coefficients"));

      const out: LocalCoefficient[] = [];
      for (const row of data ?? []) {
        const mapped = mapModelCoefficientRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_coefficients.listByRegionAndYear",
        ),
      );
    }
  }

  async listByVersion(
    version: ModelVersion,
    tahun?: Year,
  ): Promise<Result<readonly LocalCoefficient[], AppError>> {
    try {
      let query = this.client
        .from("model_coefficients")
        .select(SELECT_COLUMNS)
        .eq("model_version", version);
      if (tahun !== undefined) {
        query = query.eq("tahun", tahun);
      }
      const { data, error } = await query
        .order("predictor_code", { ascending: true })
        .order("kode_bps", { ascending: true });
      if (error) return err(mapPostgrestError(error, "model_coefficients"));

      const out: LocalCoefficient[] = [];
      for (const row of data ?? []) {
        const mapped = mapModelCoefficientRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_coefficients.listByVersion",
        ),
      );
    }
  }
}
