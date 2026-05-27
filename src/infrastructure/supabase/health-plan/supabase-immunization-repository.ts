import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { Immunization } from "@/domain/health-plan/entities/immunization";
import type { ImmunizationRepository } from "@/domain/health-plan/ports/immunization-repository";
import { mapImmunizationRow } from "@/schemas/health-plan";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "code, name, dose_number, recommended_age_months, notes, display_order, created_at, updated_at";

export class SupabaseImmunizationRepository
  implements ImmunizationRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listSchedule(): Promise<Result<readonly Immunization[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("immunization_schedule")
        .select(SELECT_COLUMNS)
        .order("display_order", { ascending: true });
      if (error) return err(mapPostgrestError(error, "immunization_schedule"));

      const out: Immunization[] = [];
      for (const row of data ?? []) {
        const mapped = mapImmunizationRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "immunization_schedule.listSchedule",
        ),
      );
    }
  }
}
