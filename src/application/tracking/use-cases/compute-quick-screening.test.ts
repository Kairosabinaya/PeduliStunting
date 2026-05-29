import { describe, expect, it } from "vitest";

import { ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { GrowthStandardRepository } from "@/domain/tracking/ports/growth-standard-repository";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import { LmsParams } from "@/domain/tracking/value-objects/lms-params";
import type { Sex } from "@/domain/tracking/value-objects/sex";

import { ComputeQuickScreeningUseCase } from "./compute-quick-screening";

class InMemoryStandardRepository implements GrowthStandardRepository {
  private readonly age = new Map<string, LmsParams>();
  private readonly length = new Map<string, LmsParams>();

  seedAge(
    indicator: Exclude<GrowthIndicator, "BB_TB">,
    sex: Sex,
    ageMonths: number,
    params: LmsParams,
  ): void {
    this.age.set(`${indicator}|${sex}|${ageMonths}`, params);
  }

  seedLength(sex: Sex, lengthCm: number, params: LmsParams): void {
    this.length.set(`${sex}|${lengthCm.toFixed(1)}`, params);
  }

  async findForAge(
    indicator: Exclude<GrowthIndicator, "BB_TB">,
    sex: Sex,
    ageMonths: number,
  ): Promise<Result<LmsParams | null, AppError>> {
    return ok(this.age.get(`${indicator}|${sex}|${ageMonths}`) ?? null);
  }

  async findForLength(
    sex: Sex,
    lengthCm: number,
  ): Promise<Result<LmsParams | null, AppError>> {
    return ok(this.length.get(`${sex}|${lengthCm.toFixed(1)}`) ?? null);
  }
}

const bbU0boys = new LmsParams({
  indicator: "BB_U",
  sex: "L",
  ageMonths: 0,
  xValue: 0,
  l: 0.3487,
  m: 3.3464,
  s: 0.14602,
});

const tbU0boys = new LmsParams({
  indicator: "TB_U",
  sex: "L",
  ageMonths: 0,
  xValue: 0,
  l: 1,
  m: 49.8842,
  s: 0.0379,
});

const bbTb50cmBoys = new LmsParams({
  indicator: "BB_TB",
  sex: "L",
  ageMonths: 0,
  xValue: 50,
  l: -0.3521,
  m: 3.0095,
  s: 0.09182,
});

describe("ComputeQuickScreeningUseCase", () => {
  function setup() {
    const standards = new InMemoryStandardRepository();
    standards.seedAge("BB_U", "L", 0, bbU0boys);
    standards.seedAge("TB_U", "L", 0, tbU0boys);
    standards.seedLength("L", 49.9, bbTb50cmBoys);
    return new ComputeQuickScreeningUseCase(standards);
  }

  it("returns stunting headline when LMS rows are available", async () => {
    const useCase = setup();
    const result = await useCase.execute({
      sex: "L",
      ageMonths: 0,
      weightKg: 3.3,
      heightCm: 49.9,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stunting?.indicator).toBe("TB_U");
    expect(result.value.missingStandards).toBe(false);
  });

  it("rejects negative measurements with validation error", async () => {
    const useCase = setup();
    const result = await useCase.execute({
      sex: "L",
      ageMonths: 0,
      weightKg: -1,
      heightCm: 49.9,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
  });

  it("rejects age outside the 0-60 month range", async () => {
    const useCase = setup();
    const result = await useCase.execute({
      sex: "L",
      ageMonths: 61,
      weightKg: 20,
      heightCm: 120,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
  });

  it("rejects when both measurements are null", async () => {
    const useCase = setup();
    const result = await useCase.execute({
      sex: "L",
      ageMonths: 0,
      weightKg: null,
      heightCm: null,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
  });

  it("flags missingStandards when no LMS row matches the requested combination", async () => {
    const standards = new InMemoryStandardRepository();
    const useCase = new ComputeQuickScreeningUseCase(standards);
    const result = await useCase.execute({
      sex: "L",
      ageMonths: 0,
      weightKg: 3.3,
      heightCm: 49.9,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.missingStandards).toBe(true);
    expect(result.value.stunting).toBeNull();
    expect(result.value.supporting).toHaveLength(0);
  });
});
