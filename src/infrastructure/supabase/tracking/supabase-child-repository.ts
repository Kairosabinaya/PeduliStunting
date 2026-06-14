import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { Child } from "@/domain/tracking/entities/child";
import type {
  ChildRepository,
  NewChildInput,
  UpdateChildInput,
} from "@/domain/tracking/ports/child-repository";
import { AppErrors } from "@/domain/errors/app-error";
import { mapChildRow } from "@/schemas/tracking";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, name, sex, birth_date, birth_weight_kg, birth_length_cm, gestational_age_weeks, notes, deleted_at, created_at, updated_at";

export class SupabaseChildRepository implements ChildRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByOwner(
    userId: UserId,
  ): Promise<Result<readonly Child[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("children")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) return err(mapPostgrestError(error, "children"));

      const out: Child[] = [];
      for (const row of data ?? []) {
        const mapped = mapChildRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "children.listByOwner"));
    }
  }

  async findById(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<Child | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("children")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("id", childId)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "children"));
      if (data === null) return ok(null);
      const mapped = mapChildRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "children.findById"));
    }
  }

  async create(input: NewChildInput): Promise<Result<Child, AppError>> {
    try {
      const { data, error } = await this.client
        .from("children")
        .insert({
          user_id: input.userId,
          name: input.name,
          sex: input.sex,
          birth_date: input.birthDate,
          birth_weight_kg: input.birthWeightKg,
          birth_length_cm: input.birthLengthCm,
          gestational_age_weeks: input.gestationalAgeWeeks,
          notes: input.notes,
        })
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "children"));
      const mapped = mapChildRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "children.create"));
    }
  }

  async update(input: UpdateChildInput): Promise<Result<Child, AppError>> {
    try {
      const { data, error } = await this.client
        .from("children")
        .update({
          name: input.name,
          sex: input.sex,
          birth_date: input.birthDate,
          birth_weight_kg: input.birthWeightKg,
          birth_length_cm: input.birthLengthCm,
          gestational_age_weeks: input.gestationalAgeWeeks,
          notes: input.notes,
        })
        .eq("user_id", input.userId)
        .eq("id", input.childId)
        .is("deleted_at", null)
        .select(SELECT_COLUMNS)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "children"));
      if (data === null) {
        return err(AppErrors.notFound("Anak tidak ditemukan.", "child"));
      }
      const mapped = mapChildRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "children.update"));
    }
  }

  async softDelete(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<void, AppError>> {
    try {
      const nowIso = new Date().toISOString();
      const { error } = await this.client
        .from("children")
        .update({ deleted_at: nowIso })
        .eq("user_id", userId)
        .eq("id", childId);
      if (error) return err(mapPostgrestError(error, "children"));
      return ok(undefined);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "children.softDelete"));
    }
  }

  async restore(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<void, AppError>> {
    try {
      // `not("deleted_at", "is", null)` scopes the clear to a row that is
      // actually soft-deleted; `select().maybeSingle()` returns null when no
      // such row exists (wrong owner, unknown id, or already active) so the
      // zero-row case maps to a precise not_found rather than a silent
      // success. `findById` filters out deleted children, so restore cannot
      // pre-check via the use case — the conditional update IS the check.
      const { data, error } = await this.client
        .from("children")
        .update({ deleted_at: null })
        .eq("user_id", userId)
        .eq("id", childId)
        .not("deleted_at", "is", null)
        .select("id")
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "children"));
      if (data === null) {
        return err(AppErrors.notFound("Anak tidak ditemukan.", "child"));
      }
      return ok(undefined);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "children.restore"));
    }
  }
}
