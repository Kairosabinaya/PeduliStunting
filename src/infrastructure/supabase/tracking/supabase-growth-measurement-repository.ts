import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, MeasurementId, UserId } from "@/domain/shared/ids";
import type { GrowthMeasurement } from "@/domain/tracking/entities/growth-measurement";
import type {
  GrowthMeasurementRepository,
  NewMeasurementInput,
} from "@/domain/tracking/ports/growth-measurement-repository";
import {
  mapGrowthMeasurementRow,
  serialiseSdClassMap,
  serialiseZScoreMap,
} from "@/schemas/tracking";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, child_id, measured_at, weight_kg, height_cm, measured_lying, head_circumference_cm, muac_cm, z_scores, sd_class, note, created_at, updated_at";

export class SupabaseGrowthMeasurementRepository
  implements GrowthMeasurementRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly GrowthMeasurement[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("growth_measurements")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("child_id", childId)
        .order("measured_at", { ascending: true });
      if (error) return err(mapPostgrestError(error, "growth_measurements"));

      const out: GrowthMeasurement[] = [];
      for (const row of data ?? []) {
        const mapped = mapGrowthMeasurementRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "growth_measurements.listByChild"),
      );
    }
  }

  async findById(
    userId: UserId,
    measurementId: MeasurementId,
  ): Promise<Result<GrowthMeasurement | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("growth_measurements")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("id", measurementId)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "growth_measurements"));
      if (data === null) return ok(null);
      const mapped = mapGrowthMeasurementRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "growth_measurements.findById"),
      );
    }
  }

  async create(
    input: NewMeasurementInput,
  ): Promise<Result<GrowthMeasurement, AppError>> {
    try {
      const { data, error } = await this.client
        .from("growth_measurements")
        .insert({
          user_id: input.userId,
          child_id: input.childId,
          measured_at: input.measuredAt,
          weight_kg: input.weightKg,
          height_cm: input.heightCm,
          measured_lying: input.measuredLying,
          head_circumference_cm: input.headCircumferenceCm,
          muac_cm: input.muacCm,
          z_scores: serialiseZScoreMap(input.zScores),
          sd_class: serialiseSdClassMap(input.sdClass),
          note: input.note,
        })
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "growth_measurements"));
      const mapped = mapGrowthMeasurementRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "growth_measurements.create"),
      );
    }
  }
}
