import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type {
  ChildId,
  MilestoneId,
  UserId,
} from "@/domain/shared/ids";
import type {
  ChildMilestone,
  ChildMilestoneStatus,
} from "@/domain/health-plan/entities/child-milestone";
import type { ChildMilestoneRepository } from "@/domain/health-plan/ports/child-milestone-repository";
import { mapChildMilestoneRow } from "@/schemas/health-plan";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, child_id, milestone_id, status, checked_at, note, created_at, updated_at";

export class SupabaseChildMilestoneRepository
  implements ChildMilestoneRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly ChildMilestone[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("child_milestones")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("child_id", childId);
      if (error) return err(mapPostgrestError(error, "child_milestones"));

      const out: ChildMilestone[] = [];
      for (const row of data ?? []) {
        const mapped = mapChildMilestoneRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "child_milestones.listByChild"),
      );
    }
  }

  async upsertStatus(input: {
    userId: UserId;
    childId: ChildId;
    milestoneId: MilestoneId;
    status: ChildMilestoneStatus;
    checkedAt: ChildMilestone["checkedAt"];
    note: string | null;
  }): Promise<Result<ChildMilestone, AppError>> {
    try {
      const { data, error } = await this.client
        .from("child_milestones")
        .upsert(
          {
            user_id: input.userId,
            child_id: input.childId,
            milestone_id: input.milestoneId,
            status: input.status,
            checked_at: input.checkedAt,
            note: input.note,
          },
          { onConflict: "child_id,milestone_id" },
        )
        .select(SELECT_COLUMNS)
        .single();
      if (error) return err(mapPostgrestError(error, "child_milestones"));
      const mapped = mapChildMilestoneRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "child_milestones.upsertStatus"),
      );
    }
  }
}
