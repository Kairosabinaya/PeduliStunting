import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionBoundary } from "@/domain/region/entities/region-boundary";
import type { RegionBoundaryRepository } from "@/domain/region/ports/region-boundary-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { mapRegionBoundaryRow } from "@/schemas/region";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "kode_bps, geometry, simplification_tolerance, source, created_at, updated_at";

export class SupabaseRegionBoundaryRepository implements RegionBoundaryRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async listAll(): Promise<Result<readonly RegionBoundary[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("region_boundaries")
        .select(SELECT_COLUMNS);
      if (error) return err(mapPostgrestError(error, "region_boundaries"));

      const out: RegionBoundary[] = [];
      for (const row of data ?? []) {
        const mapped = mapRegionBoundaryRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "region_boundaries.listAll"),
      );
    }
  }

  async findByKodeBps(
    kodeBps: KodeBps,
  ): Promise<Result<RegionBoundary | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("region_boundaries")
        .select(SELECT_COLUMNS)
        .eq("kode_bps", kodeBps)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "region_boundaries"));
      if (data === null) return ok(null);

      const mapped = mapRegionBoundaryRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "region_boundaries.findByKodeBps"),
      );
    }
  }
}
