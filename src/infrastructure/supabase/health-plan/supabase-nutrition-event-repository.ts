import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type {
  NutritionEvent,
  NutritionEventData,
  NutritionEventKind,
} from "@/domain/health-plan/entities/nutrition-event";
import type { NutritionEventRepository } from "@/domain/health-plan/ports/nutrition-event-repository";
import type { DateOnly } from "@/domain/shared/date-only";
import { mapNutritionEventRow } from "@/schemas/health-plan";
import type { Json } from "@/types/supabase";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, child_id, kind, event_date, data, note, created_at, updated_at";

export class SupabaseNutritionEventRepository implements NutritionEventRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly NutritionEvent[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("child_nutrition_events")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("child_id", childId)
        .order("event_date", { ascending: false });
      if (error) {
        return err(mapPostgrestError(error, "child_nutrition_events"));
      }
      const out: NutritionEvent[] = [];
      for (const row of data ?? []) {
        const mapped = mapNutritionEventRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "child_nutrition_events.listByChild",
        ),
      );
    }
  }

  async upsert(input: {
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
    data: NutritionEventData;
    note: string | null;
  }): Promise<Result<NutritionEvent, AppError>> {
    try {
      const { data, error } = await this.client
        .from("child_nutrition_events")
        .upsert(
          {
            user_id: input.userId,
            child_id: input.childId,
            kind: input.kind,
            event_date: input.eventDate,
            data: input.data as unknown as Json,
            note: input.note,
          },
          { onConflict: "child_id,kind,event_date" },
        )
        .select(SELECT_COLUMNS)
        .single();
      if (error) {
        return err(mapPostgrestError(error, "child_nutrition_events"));
      }
      const mapped = mapNutritionEventRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "child_nutrition_events.upsert"),
      );
    }
  }

  async delete(input: {
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
  }): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.client
        .from("child_nutrition_events")
        .delete()
        .eq("user_id", input.userId)
        .eq("child_id", input.childId)
        .eq("kind", input.kind)
        .eq("event_date", input.eventDate);
      if (error) {
        return err(mapPostgrestError(error, "child_nutrition_events"));
      }
      return ok(undefined);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "child_nutrition_events.delete"),
      );
    }
  }
}
