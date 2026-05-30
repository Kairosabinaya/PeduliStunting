import { describe, expect, it } from "vitest";

import { ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { DateOnly } from "@/domain/shared/date-only";
import type { ChildId, NutritionEventId, UserId } from "@/domain/shared/ids";
import type {
  NutritionEvent,
  NutritionEventData,
  NutritionEventKind,
} from "@/domain/health-plan/entities/nutrition-event";
import type { NutritionEventRepository } from "@/domain/health-plan/ports/nutrition-event-repository";

import { ListNutritionEventsByChildUseCase } from "./list-nutrition-events";
import { RecordNutritionEventUseCase } from "./record-nutrition-event";
import { DeleteNutritionEventUseCase } from "./delete-nutrition-event";

class FakeRepository implements NutritionEventRepository {
  public readonly stored = new Map<string, NutritionEvent>();
  public deletedKeys: Array<string> = [];

  seed(event: NutritionEvent): void {
    this.stored.set(event.id, event);
  }

  async listByChild(): Promise<Result<readonly NutritionEvent[], AppError>> {
    return ok([...this.stored.values()]);
  }

  async upsert(input: {
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
    data: NutritionEventData;
    note: string | null;
  }): Promise<Result<NutritionEvent, AppError>> {
    const event = {
      id: "evt-new" as NutritionEventId,
      userId: input.userId,
      childId: input.childId,
      kind: input.kind,
      eventDate: input.eventDate,
      data: input.data,
      note: input.note,
    } as NutritionEvent;
    this.stored.set(event.id, event);
    return ok(event);
  }

  async delete(input: {
    userId: UserId;
    childId: ChildId;
    kind: NutritionEventKind;
    eventDate: DateOnly;
  }): Promise<Result<void, AppError>> {
    this.deletedKeys.push(`${input.childId}|${input.kind}|${input.eventDate}`);
    return ok(undefined);
  }
}

const userId = "user-1" as UserId;
const childId = "child-1" as ChildId;

describe("RecordNutritionEventUseCase", () => {
  it("returns DTO with payload after upsert", async () => {
    const repo = new FakeRepository();
    const useCase = new RecordNutritionEventUseCase(repo);
    const result = await useCase.execute({
      userId,
      childId,
      kind: "asi_exclusive",
      eventDate: "2026-03-01" as DateOnly,
      data: { exclusive: true },
      note: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("asi_exclusive");
    expect(result.value.data["exclusive"]).toBe(true);
  });
});

describe("ListNutritionEventsByChildUseCase", () => {
  it("returns DTO array from repository", async () => {
    const repo = new FakeRepository();
    repo.seed({
      id: "evt-1" as NutritionEventId,
      userId,
      childId,
      kind: "deworming",
      eventDate: "2026-05-01" as DateOnly,
      data: {},
      note: null,
    } as NutritionEvent);
    const useCase = new ListNutritionEventsByChildUseCase(repo);
    const result = await useCase.execute(userId, childId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0]?.kind).toBe("deworming");
  });
});

describe("DeleteNutritionEventUseCase", () => {
  it("calls repository delete and returns ok", async () => {
    const repo = new FakeRepository();
    const useCase = new DeleteNutritionEventUseCase(repo);
    const result = await useCase.execute({
      userId,
      childId,
      kind: "vit_a_blue",
      eventDate: "2026-04-01" as DateOnly,
    });
    expect(result.ok).toBe(true);
    expect(repo.deletedKeys).toEqual(["child-1|vit_a_blue|2026-04-01"]);
  });
});
