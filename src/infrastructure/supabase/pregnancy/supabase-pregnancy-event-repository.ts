import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { PregnancyId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type {
  PregnancyEvent,
  PregnancyEventData,
  PregnancyEventKind,
} from "@/domain/pregnancy/entities/pregnancy-event";
import type { PregnancyEventRepository } from "@/domain/pregnancy/ports/pregnancy-event-repository";
import { mapPregnancyEventRow } from "@/schemas/pregnancy";
import type { Json } from "@/types/supabase";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, user_id, pregnancy_id, kind, event_date, data, note, created_at, updated_at";

export class SupabasePregnancyEventRepository implements PregnancyEventRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async listByPregnancy(
    userId: UserId,
    pregnancyId: PregnancyId,
  ): Promise<Result<readonly PregnancyEvent[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("pregnancy_events")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .eq("pregnancy_id", pregnancyId)
        .order("event_date", { ascending: false });
      if (error) {
        return err(mapPostgrestError(error, "pregnancy_events"));
      }
      const out: PregnancyEvent[] = [];
      for (const row of data ?? []) {
        const mapped = mapPregnancyEventRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "pregnancy_events.listByPregnancy",
        ),
      );
    }
  }

  async upsert(input: {
    userId: UserId;
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
    data: PregnancyEventData;
    note: string | null;
  }): Promise<Result<PregnancyEvent, AppError>> {
    try {
      const { data, error } = await this.client
        .from("pregnancy_events")
        .upsert(
          {
            user_id: input.userId,
            pregnancy_id: input.pregnancyId,
            kind: input.kind,
            event_date: input.eventDate,
            data: input.data as unknown as Json,
            note: input.note,
          },
          { onConflict: "pregnancy_id,kind,event_date" },
        )
        .select(SELECT_COLUMNS)
        .single();
      if (error) {
        return err(mapPostgrestError(error, "pregnancy_events"));
      }
      const mapped = mapPregnancyEventRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "pregnancy_events.upsert"),
      );
    }
  }

  async delete(input: {
    userId: UserId;
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
  }): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.client
        .from("pregnancy_events")
        .delete()
        .eq("user_id", input.userId)
        .eq("pregnancy_id", input.pregnancyId)
        .eq("kind", input.kind)
        .eq("event_date", input.eventDate);
      if (error) {
        return err(mapPostgrestError(error, "pregnancy_events"));
      }
      return ok(undefined);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "pregnancy_events.delete"),
      );
    }
  }
}
