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

export class IndicatorDefinition {
  readonly code: IndicatorCode;
  readonly dimension: IndicatorDimension;
  readonly name: string;
  readonly description: string | null;
  readonly unit: string | null;
  readonly sourceLabel: string | null;
  readonly sourceUrl: string | null;
  readonly effectDirection: EffectDirection | null;

  constructor(props: {
    code: IndicatorCode;
    dimension: IndicatorDimension;
    name: string;
    description: string | null;
    unit: string | null;
    sourceLabel: string | null;
    sourceUrl: string | null;
    effectDirection: EffectDirection | null;
  }) {
    this.code = props.code;
    this.dimension = props.dimension;
    this.name = props.name;
    this.description = props.description;
    this.unit = props.unit;
    this.sourceLabel = props.sourceLabel;
    this.sourceUrl = props.sourceUrl;
    this.effectDirection = props.effectDirection;
  }
}
