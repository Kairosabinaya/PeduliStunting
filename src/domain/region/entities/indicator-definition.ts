import type { IndicatorCode } from "@/domain/shared/ids";

export const INDICATOR_DIMENSIONS = [
  "outcome",
  "socioeconomic",
  "health_service",
  "environment",
  "demography",
  "nutrition",
  "other",
] as const;

export type IndicatorDimension = (typeof INDICATOR_DIMENSIONS)[number];

export const EFFECT_DIRECTIONS = ["protective", "risk", "neutral"] as const;
export type EffectDirection = (typeof EFFECT_DIRECTIONS)[number];

/**
 * The 6-dimension grouping the research uses for the predictor sliders. It is
 * distinct from {@link INDICATOR_DIMENSIONS} (the import-pipeline taxonomy) and
 * is stored verbatim in `indicator_dictionary.model_dimension`.
 */
export const MODEL_DIMENSIONS = [
  "Sosial-Ekonomi",
  "Pendidikan",
  "Kesehatan",
  "Ketahanan Pangan",
  "Konsumsi Pangan",
  "Gender",
] as const;

export type ModelDimension = (typeof MODEL_DIMENSIONS)[number];

export const PREDICTOR_TRANSFORMS = ["none", "log", "log1p"] as const;
export type PredictorTransform = (typeof PREDICTOR_TRANSFORMS)[number];

/**
 * Standardization recipe + descriptive statistics for one predictor, sourced
 * from `predictor_meta`. All fields are nullable because the outcome rows
 * (`Y`, `Y1`) carry none of them; only X1..X20 are fully populated.
 */
export interface PredictorModelMeta {
  readonly transform: PredictorTransform | null;
  readonly stdMean: number | null;
  readonly stdSd: number | null;
  readonly origMin: number | null;
  readonly origMax: number | null;
  readonly origP5: number | null;
  readonly origP50: number | null;
  readonly origP95: number | null;
  readonly pctActive: number | null;
  readonly pctPositive: number | null;
  readonly medianCoef: number | null;
  readonly corPrevalence: number | null;
  readonly modelDimension: ModelDimension | null;
  readonly displayOrder: number | null;
}

export class IndicatorDefinition {
  readonly code: IndicatorCode;
  readonly dimension: IndicatorDimension;
  readonly name: string;
  readonly description: string | null;
  readonly unit: string | null;
  readonly sourceLabel: string | null;
  readonly sourceUrl: string | null;
  readonly effectDirection: EffectDirection | null;
  readonly model: PredictorModelMeta;

  constructor(props: {
    code: IndicatorCode;
    dimension: IndicatorDimension;
    name: string;
    description: string | null;
    unit: string | null;
    sourceLabel: string | null;
    sourceUrl: string | null;
    effectDirection: EffectDirection | null;
    model: PredictorModelMeta;
  }) {
    this.code = props.code;
    this.dimension = props.dimension;
    this.name = props.name;
    this.description = props.description;
    this.unit = props.unit;
    this.sourceLabel = props.sourceLabel;
    this.sourceUrl = props.sourceUrl;
    this.effectDirection = props.effectDirection;
    this.model = props.model;
  }
}
