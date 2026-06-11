import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { Region } from "@/domain/region/entities/region";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { mapRegionRow } from "@/schemas/region";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

export class SupabaseRegionRepository implements RegionRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Result<readonly Region[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("regions")
        .select(
          "kode_bps, provinsi, kabupaten_kota, tipe, latitude, longitude, created_at, updated_at",
        )
        .order("provinsi", { ascending: true })
        .order("kabupaten_kota", { ascending: true });
      if (error) return err(mapPostgrestError(error, "regions"));

      const regions: Region[] = [];
      for (const row of data ?? []) {
        const mapped = mapRegionRow(row);
        if (!mapped.ok) return err(mapped.error);
        regions.push(mapped.value);
      }
      return ok(regions);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "regions.list"));
    }
  }

  async findByKodeBps(
    kodeBps: KodeBps,
  ): Promise<Result<Region | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("regions")
        .select(
          "kode_bps, provinsi, kabupaten_kota, tipe, latitude, longitude, created_at, updated_at",
        )
        .eq("kode_bps", kodeBps)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "regions"));
      if (data === null) return ok(null);

      const mapped = mapRegionRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "regions.findByKodeBps"));
    }
  }
}
