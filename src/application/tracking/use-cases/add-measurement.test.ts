import { describe, expect, it } from "vitest";

import { ok, err, type Result } from "@/domain/shared/result";
import {
  AppErrors,
  type AppError,
  type NotFoundError,
} from "@/domain/errors/app-error";
import { asChildId, asMeasurementId, asUserId } from "@/domain/shared/ids";
import { asDateOnly } from "@/domain/shared/date-only";
import { Child } from "@/domain/tracking/entities/child";
import {
  GrowthMeasurement,
  type SdClassMap,
  type ZScoreMap,
} from "@/domain/tracking/entities/growth-measurement";
import type {
  ChildRepository,
  NewChildInput,
  UpdateChildInput,
} from "@/domain/tracking/ports/child-repository";
import type {
  GrowthMeasurementRepository,
  NewMeasurementInput,
} from "@/domain/tracking/ports/growth-measurement-repository";
import type { GrowthStandardRepository } from "@/domain/tracking/ports/growth-standard-repository";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import { LmsParams } from "@/domain/tracking/value-objects/lms-params";
import type { Sex } from "@/domain/tracking/value-objects/sex";

import {
  AddMeasurementUseCase,
  type AddMeasurementCommand,
} from "./add-measurement";

class InMemoryChildRepository implements ChildRepository {
  private readonly children = new Map<string, Child>();

  seed(child: Child): void {
    this.children.set(child.id, child);
  }

  async listByOwner(
    userId: string,
  ): Promise<Result<readonly Child[], AppError>> {
    return ok([...this.children.values()].filter((c) => c.userId === userId));
  }

  async findById(
    userId: string,
    childId: string,
  ): Promise<Result<Child | null, AppError>> {
    const child = this.children.get(childId);
    if (!child || child.userId !== userId) return ok(null);
    return ok(child);
  }

  async create(_input: NewChildInput): Promise<Result<Child, AppError>> {
    throw new Error("not implemented in this fake");
  }

  async update(_input: UpdateChildInput): Promise<Result<Child, AppError>> {
    throw new Error("not implemented in this fake");
  }

  async softDelete(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

class InMemoryMeasurementRepository implements GrowthMeasurementRepository {
  public readonly created: NewMeasurementInput[] = [];
  private counter = 0;

  async listByChild(): Promise<Result<readonly GrowthMeasurement[], AppError>> {
    return ok([]);
  }

  async findById(): Promise<Result<GrowthMeasurement | null, AppError>> {
    return ok(null);
  }

  async create(
    input: NewMeasurementInput,
  ): Promise<Result<GrowthMeasurement, AppError>> {
    this.created.push(input);
    this.counter += 1;
    return ok(
      new GrowthMeasurement({
        id: asMeasurementId(
          `00000000-0000-0000-0000-${String(this.counter).padStart(12, "0")}`,
        ),
        userId: input.userId,
        childId: input.childId,
        measuredAt: input.measuredAt,
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        measuredLying: input.measuredLying,
        headCircumferenceCm: input.headCircumferenceCm,
        muacCm: input.muacCm,
        zScores: input.zScores,
        sdClass: input.sdClass,
        note: input.note,
      }),
    );
  }
}

interface StandardKey {
  readonly indicator: Exclude<GrowthIndicator, "BB_TB">;
  readonly sex: Sex;
  readonly ageMonths: number;
}

class InMemoryStandardRepository implements GrowthStandardRepository {
  private readonly age = new Map<string, LmsParams>();
  private readonly length = new Map<string, LmsParams>();

  seedAge(key: StandardKey, params: LmsParams): void {
    this.age.set(this.ageKey(key), params);
  }

  seedLength(sex: Sex, lengthCm: number, params: LmsParams): void {
    this.length.set(this.lengthKey(sex, lengthCm), params);
  }

  private ageKey(key: StandardKey): string {
    return `${key.indicator}|${key.sex}|${key.ageMonths}`;
  }

  private lengthKey(sex: Sex, cm: number): string {
    return `${sex}|${cm.toFixed(1)}`;
  }

  async findForAge(
    indicator: Exclude<GrowthIndicator, "BB_TB">,
    sex: Sex,
    ageMonths: number,
  ): Promise<Result<LmsParams | null, AppError>> {
    return ok(this.age.get(this.ageKey({ indicator, sex, ageMonths })) ?? null);
  }

  async findForLength(
    sex: Sex,
    lengthCm: number,
  ): Promise<Result<LmsParams | null, AppError>> {
    return ok(this.length.get(this.lengthKey(sex, lengthCm)) ?? null);
  }
}

const userId = asUserId("00000000-0000-0000-0000-000000000001");
const childId = asChildId("00000000-0000-0000-0000-000000000002");

function makeChild(): Child {
  return new Child({
    id: childId,
    userId,
    name: "Anak Uji",
    sex: "L",
    birthDate: asDateOnly("2024-01-15"),
    birthWeightKg: 3.3,
    birthLengthCm: 50,
    gestationalAgeWeeks: 38,
    notes: null,
    deletedAt: null,
  });
}

function lms(
  indicator: GrowthIndicator,
  ageMonths: number,
  xValue: number,
  l: number,
  m: number,
  s: number,
): LmsParams {
  return new LmsParams({
    indicator,
    sex: "L",
    ageMonths,
    xValue,
    l,
    m,
    s,
  });
}

const lmsWfa24m = lms("BB_U", 24, 0, -0.1733, 12.1515, 0.10822);
const lmsHfa24m = lms("TB_U", 24, 0, 1, 87.1161, 0.03968);
const lmsHcFa24m = lms("LK_U", 24, 0, 1, 49.2543, 0.03331);
const lmsWfl87 = lms("BB_TB", 0, 87, -0.3521, 12.1, 0.08321);

describe("AddMeasurementUseCase", () => {
  function setup(): {
    useCase: AddMeasurementUseCase;
    children: InMemoryChildRepository;
    measurements: InMemoryMeasurementRepository;
    standards: InMemoryStandardRepository;
  } {
    const children = new InMemoryChildRepository();
    const measurements = new InMemoryMeasurementRepository();
    const standards = new InMemoryStandardRepository();
    children.seed(makeChild());
    standards.seedAge(
      { indicator: "BB_U", sex: "L", ageMonths: 24 },
      lmsWfa24m,
    );
    standards.seedAge(
      { indicator: "TB_U", sex: "L", ageMonths: 24 },
      lmsHfa24m,
    );
    standards.seedAge(
      { indicator: "LK_U", sex: "L", ageMonths: 24 },
      lmsHcFa24m,
    );
    standards.seedLength("L", 87, lmsWfl87);
    return {
      useCase: new AddMeasurementUseCase(children, measurements, standards),
      children,
      measurements,
      standards,
    };
  }

  const baseCommand: AddMeasurementCommand = {
    userId,
    childId,
    measuredAt: asDateOnly("2026-01-15"),
    weightKg: 12.0,
    heightCm: 87.0,
    measuredLying: false,
    headCircumferenceCm: 49.0,
    muacCm: null,
    note: null,
  };

  it("computes all four z-scores when all measurements are provided", async () => {
    const { useCase, measurements } = setup();
    const result = await useCase.execute(baseCommand);
    expect(result.ok).toBe(true);
    expect(measurements.created).toHaveLength(1);
    const stored = measurements.created[0];
    if (!stored) throw new Error("expected one persisted measurement");
    const z: ZScoreMap = stored.zScores;
    const cls: SdClassMap = stored.sdClass;
    expect(z.BB_U).toBeDefined();
    expect(z.TB_U).toBeDefined();
    expect(z.LK_U).toBeDefined();
    expect(z.BB_TB).toBeDefined();
    expect(cls.BB_U).toBeDefined();
    expect(cls.TB_U).toBeDefined();
    expect(cls.LK_U).toBeDefined();
    expect(cls.BB_TB).toBeDefined();
  });

  it("skips BB_TB when height is missing even if weight is present", async () => {
    const { useCase, measurements } = setup();
    const result = await useCase.execute({
      ...baseCommand,
      heightCm: null,
      headCircumferenceCm: null,
    });
    expect(result.ok).toBe(true);
    const stored = measurements.created[0];
    if (!stored) throw new Error("expected one persisted measurement");
    expect(stored.zScores.BB_U).toBeDefined();
    expect(stored.zScores.BB_TB).toBeUndefined();
    expect(stored.zScores.TB_U).toBeUndefined();
  });

  it("omits all indicators when no LMS rows are available for the lookup keys", async () => {
    const { useCase, measurements, standards } = setup();
    standards.findForAge = async () => ok(null);
    standards.findForLength = async () => ok(null);
    const result = await useCase.execute(baseCommand);
    expect(result.ok).toBe(true);
    const stored = measurements.created[0];
    if (!stored) throw new Error("expected one persisted measurement");
    expect(stored.zScores).toEqual({});
    expect(stored.sdClass).toEqual({});
  });

  it("rejects a measurement when the child is older than the WHO standard range", async () => {
    const { useCase, measurements } = setup();
    // Child born 2024-01-15; measured at ~62 months old (beyond WHO 0-60mo).
    const result = await useCase.execute({
      ...baseCommand,
      measuredAt: asDateOnly("2029-03-15"),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
    }
    // Must not silently persist a status-less measurement.
    expect(measurements.created).toHaveLength(0);
  });

  it("maps a duplicate-date conflict to a friendly message (no raw DB text)", async () => {
    const { useCase, measurements } = setup();
    measurements.create = async () =>
      err(
        AppErrors.conflict(
          'duplicate key value violates unique constraint "growth_measurements_child_id_measured_at_key"',
        ),
      );
    const result = await useCase.execute(baseCommand);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("conflict");
      expect(result.error.message).toMatch(/tanggal/i);
      expect(result.error.message).not.toMatch(/duplicate key|constraint/i);
    }
  });

  it("rejects measurements dated before the child's birth", async () => {
    const { useCase } = setup();
    const result = await useCase.execute({
      ...baseCommand,
      measuredAt: asDateOnly("2024-01-14"),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
    }
  });

  it("returns NotFound when the child does not exist for this user", async () => {
    const { useCase } = setup();
    const result = await useCase.execute({
      ...baseCommand,
      childId: asChildId("99999999-9999-9999-9999-999999999999"),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const error = result.error as NotFoundError;
      expect(error.kind).toBe("not_found");
      expect(error.resource).toBe("children");
    }
  });

  it("propagates repository errors from the standards lookup", async () => {
    const { useCase, standards } = setup();
    const failure = AppErrors.unexpected("simulated DB down");
    standards.findForAge = async () => err(failure);
    const result = await useCase.execute(baseCommand);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(failure);
    }
  });
});
