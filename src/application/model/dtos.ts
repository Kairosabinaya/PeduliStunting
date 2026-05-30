import type { ModelMetadata } from "@/domain/model/entities/model-metadata";
import type { ModelPrediction } from "@/domain/model/entities/model-prediction";

/**
 * Everything the what-if simulator needs for one region-year: the local
 * intercepts + slopes, the region's actual predictor values (slider defaults),
 * its observed class, and the model's stored probabilities. `beta` and
 * `defaults` are ordered X1..X20 so they zip with the predictor meta the client
 * already holds. Returned by `GetRegionFitUseCase`; `null` from the use case
 * means the model did not fit that region-year.
 */
export interface RegionFitDto {
  readonly modelVersion: string;
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly tahun: number;
  readonly alfa1: number;
  readonly alfa2: number;
  readonly nActive: number | null;
  readonly converged: boolean;
  readonly beta: readonly number[];
  readonly defaults: readonly number[];
  readonly actualCategory: "Rendah" | "Sedang" | "Tinggi";
  readonly observed: {
    readonly rendah: number | null;
    readonly sedang: number | null;
    readonly tinggi: number | null;
  } | null;
}

export interface ModelMetadataDto {
  readonly version: string;
  readonly name: string;
  readonly etaSign: number;
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
    etaSign: metadata.etaSign,
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
