import { describe, expect, it } from "vitest";

import { err, ok, type Result } from "@/domain/shared/result";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { LocalCoefficient } from "@/domain/model/entities/local-coefficient";
import type { LocalCoefficientRepository } from "@/domain/model/ports/local-coefficient-repository";
import { asIndicatorCode, asModelVersion } from "@/domain/shared/ids";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";
import { asYear, type Year } from "@/domain/region/value-objects/year";

import { GetCoefficientSummaryUseCase } from "./get-coefficient-summary";

const VERSION = asModelVersion("gtwenolr-v1");

class InMemoryCoefficientRepo implements LocalCoefficientRepository {
  public readonly rows: LocalCoefficient[] = [];
  public lastTahun: Year | undefined;

  seed(rows: LocalCoefficient[]): void {
    this.rows.push(...rows);
  }

  async listByRegionAndYear(): Promise<
    Result<readonly LocalCoefficient[], AppError>
  > {
    return ok([]);
  }

  async listByVersion(
    _version: string,
    tahun?: Year,
  ): Promise<Result<readonly LocalCoefficient[], AppError>> {
    this.lastTahun = tahun;
    const filtered = tahun
      ? this.rows.filter((row) => row.tahun === tahun)
      : this.rows;
    return ok(filtered);
  }
}

class FailingRepo implements LocalCoefficientRepository {
  async listByRegionAndYear(): Promise<
    Result<readonly LocalCoefficient[], AppError>
  > {
    return ok([]);
  }

  async listByVersion(): Promise<
    Result<readonly LocalCoefficient[], AppError>
  > {
    return err(AppErrors.externalService("supabase down", "supabase"));
  }
}

function makeRow(
  predictor: string,
  kodeBps: string,
  tahun: number,
  coefficient: number,
  isInference = false,
): LocalCoefficient {
  return new LocalCoefficient({
    modelVersion: VERSION,
    kodeBps: asKodeBps(kodeBps),
    tahun: asYear(tahun),
    predictorCode: asIndicatorCode(predictor),
    coefficient,
    se: null,
    isInference,
  });
}

describe("GetCoefficientSummaryUseCase", () => {
  describe("execute", () => {
    it("returns an empty items list when the repository has no rows", async () => {
      const repo = new InMemoryCoefficientRepo();
      const useCase = new GetCoefficientSummaryUseCase(repo);
      const result = await useCase.execute({ version: VERSION });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toEqual([]);
      expect(result.value.modelVersion).toBe(VERSION);
      expect(result.value.tahun).toBeNull();
    });

    it("averages coefficient values per predictor across regions and years", async () => {
      const repo = new InMemoryCoefficientRepo();
      repo.seed([
        makeRow("X6", "3201", 2024, -0.4),
        makeRow("X6", "3202", 2024, -0.2),
        makeRow("X12", "3201", 2024, 0.3),
      ]);
      const useCase = new GetCoefficientSummaryUseCase(repo);
      const result = await useCase.execute({ version: VERSION });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const byPredictor = Object.fromEntries(
        result.value.items.map((item) => [item.predictorCode, item]),
      );
      expect(byPredictor.X6?.meanCoefficient).toBeCloseTo(-0.3, 6);
      expect(byPredictor.X6?.contributingRegions).toBe(2);
      expect(byPredictor.X6?.sampleCount).toBe(2);
      expect(byPredictor.X12?.meanCoefficient).toBeCloseTo(0.3, 6);
      expect(byPredictor.X12?.contributingRegions).toBe(1);
    });

    it("tracks min/max range across all contributing rows", async () => {
      const repo = new InMemoryCoefficientRepo();
      repo.seed([
        makeRow("X1", "3201", 2024, -0.5),
        makeRow("X1", "3202", 2024, 0.1),
        makeRow("X1", "3203", 2024, 0.4),
      ]);
      const useCase = new GetCoefficientSummaryUseCase(repo);
      const result = await useCase.execute({ version: VERSION });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const item = result.value.items[0];
      expect(item?.minCoefficient).toBe(-0.5);
      expect(item?.maxCoefficient).toBe(0.4);
    });

    it("forwards the tahun filter to the repository", async () => {
      const repo = new InMemoryCoefficientRepo();
      repo.seed([
        makeRow("X3", "3201", 2023, 0.1),
        makeRow("X3", "3201", 2024, 0.5),
      ]);
      const useCase = new GetCoefficientSummaryUseCase(repo);
      const tahun = asYear(2024);
      const result = await useCase.execute({ version: VERSION, tahun });

      expect(repo.lastTahun).toBe(tahun);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.tahun).toBe(tahun);
      expect(result.value.items[0]?.meanCoefficient).toBeCloseTo(0.5, 6);
    });

    it("sets hasInference when any contributing row is flagged", async () => {
      const repo = new InMemoryCoefficientRepo();
      repo.seed([
        makeRow("X4", "3201", 2024, 0.2, false),
        makeRow("X4", "3202", 2024, 0.1, true),
      ]);
      const useCase = new GetCoefficientSummaryUseCase(repo);
      const result = await useCase.execute({ version: VERSION });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items[0]?.hasInference).toBe(true);
    });

    it("propagates repository failures unchanged", async () => {
      const useCase = new GetCoefficientSummaryUseCase(new FailingRepo());
      const result = await useCase.execute({ version: VERSION });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe("external_service");
    });
  });
});
