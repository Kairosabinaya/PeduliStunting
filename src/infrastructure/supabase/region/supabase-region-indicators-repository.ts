import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionIndicators } from "@/domain/region/entities/region-indicators";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { asYear, type Year } from "@/domain/region/value-objects/year";
import { mapRegionIndicatorsRow } from "@/schemas/region";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "kode_bps, tahun, y_category, y1_prevalence, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15, x16, x17, x18, x19, x20, id, created_at, updated_at";

export class SupabaseRegionIndicatorsRepository
  implements RegionIndicatorsRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByYear(
    tahun: Year,
  ): Promise<Result<readonly RegionIndicators[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("region_indicators")
        .select(SELECT_COLUMNS)
        .eq("tahun", tahun);
      if (error) return err(mapPostgrestError(error, "region_indicators"));

      const out: RegionIndicators[] = [];
      for (const row of data ?? []) {
        const mapped = mapRegionIndicatorsRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "region_indicators.listByYear"),
      );
    }
  }

  async findByRegion(
    kodeBps: KodeBps,
  ): Promise<Result<readonly RegionIndicators[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("region_indicators")
        .select(SELECT_COLUMNS)
        .eq("kode_bps", kodeBps)
        .order("tahun", { ascending: true });
      if (error) return err(mapPostgrestError(error, "region_indicators"));

      const out: RegionIndicators[] = [];
      for (const row of data ?? []) {
        const mapped = mapRegionIndicatorsRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "region_indicators.findByRegion"),
      );
    }
  }

  async findOne(
    kodeBps: KodeBps,
    tahun: Year,
  ): Promise<Result<RegionIndicators | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("region_indicators")
        .select(SELECT_COLUMNS)
        .eq("kode_bps", kodeBps)
        .eq("tahun", tahun)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "region_indicators"));
      if (data === null) return ok(null);

      const mapped = mapRegionIndicatorsRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "region_indicators.findOne"),
      );
    }
  }

  async listAvailableYears(): Promise<Result<readonly Year[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("region_indicators")
        .select("tahun")
        .order("tahun", { ascending: true });
      if (error) return err(mapPostgrestError(error, "region_indicators"));

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
          "region_indicators.listAvailableYears",
        ),
      );
    }
  }
}
