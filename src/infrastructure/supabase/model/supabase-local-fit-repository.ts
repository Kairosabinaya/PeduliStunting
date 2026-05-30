import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelVersion } from "@/domain/shared/ids";
import type { LocalFit } from "@/domain/model/entities/local-fit";
import type {
  FittedRegionYear,
  LocalFitRepository,
} from "@/domain/model/ports/local-fit-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import { asYear } from "@/domain/region/value-objects/year";
import { mapModelLocalFitRow } from "@/schemas/model";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, model_version, kode_bps, tahun, alfa1, alfa2, n_active, converged, created_at, updated_at";

// PostgREST caps a single response page; the fitted set (~2056 rows) exceeds it,
// so listFittedRegionYears pages through with range() until a short page lands.
const PAGE_SIZE = 1000;

export class SupabaseLocalFitRepository implements LocalFitRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async findByRegionYear(
    version: ModelVersion,
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<LocalFit | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("model_local_fits")
        .select(SELECT_COLUMNS)
        .eq("model_version", version)
        .eq("kode_bps", kodeBps)
        .eq("tahun", tahun)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "model_local_fits"));
      if (data === null) return ok(null);
      const mapped = mapModelLocalFitRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_local_fits.findByRegionYear",
        ),
      );
    }
  }

  async listFittedRegionYears(
    version: ModelVersion,
  ): Promise<Result<readonly FittedRegionYear[], AppError>> {
    try {
      const out: FittedRegionYear[] = [];
      for (let page = 0; ; page += 1) {
        const from = page * PAGE_SIZE;
        const { data, error } = await this.client
          .from("model_local_fits")
          .select("kode_bps, tahun")
          .eq("model_version", version)
          .order("kode_bps", { ascending: true })
          .order("tahun", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error) return err(mapPostgrestError(error, "model_local_fits"));
        const rows = data ?? [];
        for (const row of rows) {
          out.push({
            kodeBps: asKodeBps(row.kode_bps),
            tahun: asYear(row.tahun),
          });
        }
        if (rows.length < PAGE_SIZE) break;
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "model_local_fits.listFittedRegionYears",
        ),
      );
    }
  }
}
