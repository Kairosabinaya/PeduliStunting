import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { Milestone } from "@/domain/health-plan/entities/milestone";
import type { MilestoneRepository } from "@/domain/health-plan/ports/milestone-repository";
import { mapMilestoneRow } from "@/schemas/health-plan";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, code, domain, min_age_months, max_age_months, description, source_label, display_order, created_at, updated_at";

export class SupabaseMilestoneRepository implements MilestoneRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Result<readonly Milestone[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("milestones")
        .select(SELECT_COLUMNS)
        .order("display_order", { ascending: true });
      if (error) return err(mapPostgrestError(error, "milestones"));

      const out: Milestone[] = [];
      for (const row of data ?? []) {
        const mapped = mapMilestoneRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(mapUnknownInfrastructureError(cause, "milestones.list"));
    }
  }
}
