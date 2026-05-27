import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { ChildImmunization } from "@/domain/health-plan/entities/child-immunization";
import type { ChildImmunizationRepository } from "@/domain/health-plan/ports/child-immunization-repository";
import { mapChildImmunizationRow } from "@/schemas/health-plan";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, child_id, immunization_code, status, given_at, note, created_at, updated_at";

export class SupabaseChildImmunizationRepository
  implements ChildImmunizationRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildImmunization[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("child_immunizations")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("child_id", childId);
      if (error) return err(mapPostgrestError(error, "child_immunizations"));

      const out: ChildImmunization[] = [];
      for (const row of data ?? []) {
        const mapped = mapChildImmunizationRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "child_immunizations.listByChild",
        ),
      );
    }
  }

  async upsertStatus(input: {
    userId: UserId;
    childId: ChildId;
    immunizationCode: ChildImmunization["immunizationCode"];
    status: ChildImmunization["status"];
    givenAt: ChildImmunization["givenAt"];
    note: string | null;
  }): Promise<Result<ChildImmunization, AppError>> {
    try {
      const { data, error } = await this.client
        .from("child_immunizations")
        .upsert(
          {
            user_id: input.userId,
            child_id: input.childId,
            immunization_code: input.immunizationCode,
            status: input.status,
            given_at: input.givenAt,
            note: input.note,
          },
          { onConflict: "child_id,immunization_code" },
        )
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "child_immunizations"));
      const mapped = mapChildImmunizationRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "child_immunizations.upsertStatus",
        ),
      );
    }
  }
}
