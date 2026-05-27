import type { LocalCoefficient } from "@/domain/model/entities/local-coefficient";
import type { ModelMetadata } from "@/domain/model/entities/model-metadata";
import type { ModelPrediction } from "@/domain/model/entities/model-prediction";

export interface ModelMetadataDto {
  readonly version: string;
  readonly name: string;
  readonly hyperparameters: Readonly<Record<string, unknown>>;
  readonly metrics: Readonly<Record<string, unknown>>;
  readonly moranPerYear: Readonly<Record<string, unknown>>;
  readonly notes: string | null;
  readonly isDefault: boolean;
}

export interface ModelPredictionDto {
  readonly modelVersion: string;
  readonly kodeBps: string;
  readonly tahun: number;
  readonly predictedCategory: "Rendah" | "Sedang" | "Tinggi";
  readonly probRendah: number | null;
  readonly probSedang: number | null;
  readonly probTinggi: number | null;
}

export function toModelMetadataDto(metadata: ModelMetadata): ModelMetadataDto {
  return {
    version: metadata.version,
    name: metadata.name,
    hyperparameters: metadata.hyperparameters,
    metrics: metadata.metrics,
    moranPerYear: metadata.moranPerYear,
    notes: metadata.notes,
    isDefault: metadata.isDefault,
  };
}

export function toModelPredictionDto(
  prediction: ModelPrediction,
): ModelPredictionDto {
  return {
    modelVersion: prediction.modelVersion,
    kodeBps: prediction.kodeBps,
    tahun: prediction.tahun,
    predictedCategory: prediction.predictedCategory,
    probRendah: prediction.probabilities.rendah,
    probSedang: prediction.probabilities.sedang,
    probTinggi: prediction.probabilities.tinggi,
  };
}

/**
 * Per-predictor aggregate of the local coefficients exported from the R model.
 * The summary is calculated by `GetCoefficientSummaryUseCase` and consumed by
 * the dashboard what-if simulator.
 */
export interface CoefficientSummaryItemDto {
  readonly predictorCode: string;
  readonly meanCoefficient: number;
  readonly minCoefficient: number;
  readonly maxCoefficient: number;
  /** Distinct kabupaten/kota that contributed to the aggregate. */
  readonly contributingRegions: number;
  /** Number of coefficient rows aggregated (regions x years). */
  readonly sampleCount: number;
  /** True when at least one contributing row is flagged is_inference. */
  readonly hasInference: boolean;
}

export interface CoefficientSummaryDto {
  readonly modelVersion: string;
  readonly tahun: number | null;
  readonly items: readonly CoefficientSummaryItemDto[];
}

export function summariseCoefficients(
  modelVersion: string,
  tahun: number | null,
  rows: readonly LocalCoefficient[],
): CoefficientSummaryDto {
  const buckets = new Map<
    string,
    {
      sum: number;
      min: number;
      max: number;
      count: number;
      regions: Set<string>;
      hasInference: boolean;
    }
  >();

  for (const row of rows) {
    const bucket = buckets.get(row.predictorCode);
    if (bucket) {
      bucket.sum += row.coefficient;
      bucket.count += 1;
      bucket.min = Math.min(bucket.min, row.coefficient);
      bucket.max = Math.max(bucket.max, row.coefficient);
      bucket.regions.add(row.kodeBps);
      bucket.hasInference = bucket.hasInference || row.isInference;
    } else {
      buckets.set(row.predictorCode, {
        sum: row.coefficient,
        min: row.coefficient,
        max: row.coefficient,
        count: 1,
        regions: new Set([row.kodeBps]),
        hasInference: row.isInference,
      });
    }
  }

  const items: CoefficientSummaryItemDto[] = [];
  for (const [predictorCode, bucket] of buckets) {
    items.push({
      predictorCode,
      meanCoefficient: bucket.sum / bucket.count,
      minCoefficient: bucket.min,
      maxCoefficient: bucket.max,
      contributingRegions: bucket.regions.size,
      sampleCount: bucket.count,
      hasInference: bucket.hasInference,
    });
  }
  items.sort((a, b) => a.predictorCode.localeCompare(b.predictorCode));

  return { modelVersion, tahun, items };
}
