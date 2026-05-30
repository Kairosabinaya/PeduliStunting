import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { Pregnancy } from "@/domain/pregnancy/entities/pregnancy";
import type {
  NewPregnancyInput,
  PregnancyRepository,
  UpdatePregnancyInput,
} from "@/domain/pregnancy/ports/pregnancy-repository";
import { mapPregnancyRow } from "@/schemas/pregnancy";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, hpht, expected_due, initial_weight_kg, height_cm, notes, archived_at, created_at, updated_at";

export class SupabasePregnancyRepository implements PregnancyRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async findActiveByUser(
    userId: UserId,
  ): Promise<Result<Pregnancy | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("pregnancies")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "pregnancies"));
      if (data === null) return ok(null);
      const mapped = mapPregnancyRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "pregnancies.findActiveByUser"),
      );
    }
  }

  async findById(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<Pregnancy | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("pregnancies")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("id", pregnancyId)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "pregnancies"));
      if (data === null) return ok(null);
      const mapped = mapPregnancyRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "pregnancies.findById"));
    }
  }

  async create(input: NewPregnancyInput): Promise<Result<Pregnancy, AppError>> {
    try {
      const { data, error } = await this.client
        .from("pregnancies")
        .insert({
          user_id: input.userId,
          hpht: input.hpht,
          expected_due: input.expectedDue,
          initial_weight_kg: input.initialWeightKg,
          height_cm: input.heightCm,
          notes: input.notes,
        })
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "pregnancies"));
      const mapped = mapPregnancyRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "pregnancies.create"));
    }
  }

  async update(
    input: UpdatePregnancyInput,
  ): Promise<Result<Pregnancy, AppError>> {
    try {
      const { data, error } = await this.client
        .from("pregnancies")
        .update({
          hpht: input.hpht,
          expected_due: input.expectedDue,
          initial_weight_kg: input.initialWeightKg,
          height_cm: input.heightCm,
          notes: input.notes,
        })
        .eq("user_id", input.userId)
        .eq("id", input.pregnancyId)
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "pregnancies"));
      const mapped = mapPregnancyRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "pregnancies.update"));
    }
  }

  async archive(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.client
        .from("pregnancies")
        .update({ archived_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("id", pregnancyId);
      if (error) return err(mapPostgrestError(error, "pregnancies"));
      return ok(undefined);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "pregnancies.archive"));
    }
  }
}
