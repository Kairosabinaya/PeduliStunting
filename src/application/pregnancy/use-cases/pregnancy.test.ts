import { describe, expect, it } from "vitest";

import { ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type {
  PregnancyId,
  PregnancyEventId,
  UserId,
} from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { Pregnancy } from "@/domain/pregnancy/entities/pregnancy";
import type {
  PregnancyEvent,
  PregnancyEventData,
  PregnancyEventKind,
} from "@/domain/pregnancy/entities/pregnancy-event";
import type { PregnancyEventRepository } from "@/domain/pregnancy/ports/pregnancy-event-repository";
import type {
  NewPregnancyInput,
  PregnancyRepository,
  UpdatePregnancyInput,
} from "@/domain/pregnancy/ports/pregnancy-repository";

import { GetActivePregnancyUseCase } from "./get-active-pregnancy";
import { UpsertPregnancyUseCase } from "./upsert-pregnancy";
import { ListPregnancyEventsUseCase } from "./list-pregnancy-events";
import { RecordPregnancyEventUseCase } from "./record-pregnancy-event";
import { DeletePregnancyEventUseCase } from "./delete-pregnancy-event";

class FakePregnancyRepo implements PregnancyRepository {
  public stored: Pregnancy | null = null;
  public archived = false;

  async findActiveByUser(): Promise<Result<Pregnancy | null, AppError>> {
    return ok(this.stored && !this.archived ? this.stored : null);
  }
  async findById(): Promise<Result<Pregnancy | null, AppError>> {
    return ok(this.stored);
  }
  async create(input: NewPregnancyInput): Promise<Result<Pregnancy, AppError>> {
    const pregnancy = {
      id: "preg-new" as PregnancyId,
      userId: input.userId,
      hpht: input.hpht,
      expectedDue: input.expectedDue,
      initialWeightKg: input.initialWeightKg,
      heightCm: input.heightCm,
      notes: input.notes,
      archivedAt: null,
    } as Pregnancy;
    this.stored = pregnancy;
    return ok(pregnancy);
  }
  async update(
    input: UpdatePregnancyInput,
  ): Promise<Result<Pregnancy, AppError>> {
    const pregnancy = {
      id: input.pregnancyId,
      userId: input.userId,
      hpht: input.hpht,
      expectedDue: input.expectedDue,
      initialWeightKg: input.initialWeightKg,
      heightCm: input.heightCm,
      notes: input.notes,
      archivedAt: null,
    } as Pregnancy;
    this.stored = pregnancy;
    return ok(pregnancy);
  }
  async archive(): Promise<Result<void, AppError>> {
    this.archived = true;
    return ok(undefined);
  }
}

class FakeEventRepo implements PregnancyEventRepository {
  public readonly events: PregnancyEvent[] = [];
  public deletedKeys: string[] = [];

  async listByPregnancy(): Promise<
    Result<readonly PregnancyEvent[], AppError>
  > {
    return ok([...this.events]);
  }
  async upsert(input: {
    userId: UserId;
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
    data: PregnancyEventData;
    note: string | null;
  }): Promise<Result<PregnancyEvent, AppError>> {
    const event = {
      id: "evt-new" as PregnancyEventId,
      userId: input.userId,
      pregnancyId: input.pregnancyId,
      kind: input.kind,
      eventDate: input.eventDate,
      data: input.data,
      note: input.note,
    } as PregnancyEvent;
    this.events.push(event);
    return ok(event);
  }
  async delete(input: {
    pregnancyId: PregnancyId;
    kind: PregnancyEventKind;
    eventDate: DateOnly;
  }): Promise<Result<void, AppError>> {
    this.deletedKeys.push(
      `${input.pregnancyId}|${input.kind}|${input.eventDate}`,
    );
    return ok(undefined);
  }
}

const userId = "user-1" as UserId;

describe("UpsertPregnancyUseCase", () => {
  it("creates when no pregnancyId provided", async () => {
    const repo = new FakePregnancyRepo();
    const useCase = new UpsertPregnancyUseCase(repo);
    const result = await useCase.execute({
      userId,
      pregnancyId: null,
      hpht: "2026-01-01" as DateOnly,
      expectedDue: null,
      initialWeightKg: 58,
      heightCm: 160,
      notes: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.hpht).toBe("2026-01-01");
  });
});

describe("GetActivePregnancyUseCase", () => {
  it("returns null when there is no active pregnancy", async () => {
    const repo = new FakePregnancyRepo();
    const useCase = new GetActivePregnancyUseCase(repo);
    const result = await useCase.execute(userId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toBeNull();
  });
});

describe("RecordPregnancyEventUseCase", () => {
  it("records an event via repository", async () => {
    const repo = new FakeEventRepo();
    const useCase = new RecordPregnancyEventUseCase(repo);
    const result = await useCase.execute({
      userId,
      pregnancyId: "preg-1" as PregnancyId,
      kind: "ttd_dose",
      eventDate: "2026-03-01" as DateOnly,
      data: {},
      note: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("ttd_dose");
    expect(repo.events).toHaveLength(1);
  });
});

describe("ListPregnancyEventsUseCase", () => {
  it("returns DTOs", async () => {
    const repo = new FakeEventRepo();
    const useCase = new ListPregnancyEventsUseCase(repo);
    const result = await useCase.execute(userId, "preg-1" as PregnancyId);
    expect(result.ok).toBe(true);
  });
});

describe("DeletePregnancyEventUseCase", () => {
  it("forwards delete to repository", async () => {
    const repo = new FakeEventRepo();
    const useCase = new DeletePregnancyEventUseCase(repo);
    const result = await useCase.execute({
      userId,
      pregnancyId: "preg-1" as PregnancyId,
      kind: "anc_visit",
      eventDate: "2026-04-01" as DateOnly,
    });
    expect(result.ok).toBe(true);
    expect(repo.deletedKeys).toEqual(["preg-1|anc_visit|2026-04-01"]);
  });
});
