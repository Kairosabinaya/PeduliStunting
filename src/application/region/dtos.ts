import type { IndicatorCode } from "@/domain/shared/ids";
import type { Region } from "@/domain/region/entities/region";
import type { RegionIndicators } from "@/domain/region/entities/region-indicators";
import type { RegionBoundary } from "@/domain/region/entities/region-boundary";
import type {
  IndicatorDefinition,
  PredictorModelMeta,
} from "@/domain/region/entities/indicator-definition";

export interface RegionDto {
  readonly kodeBps: string;
  readonly provinsi: string;
  readonly kabupatenKota: string;
  readonly tipe: "Kabupaten" | "Kota";
  readonly latitude: number | null;
  readonly longitude: number | null;
}

export interface RegionIndicatorsDto {
  readonly kodeBps: string;
  readonly tahun: number;
  readonly yCategory: "Rendah" | "Sedang" | "Tinggi";
  readonly y1Prevalence: number | null;
  readonly predictors: Readonly<Record<string, number | null>>;
}

export interface RegionBoundaryDto {
  readonly kodeBps: string;
  readonly geometry: unknown;
  readonly simplificationTolerance: number | null;
  readonly source: string | null;
}

export interface IndicatorDefinitionDto {
  readonly code: string;
  readonly dimension: string;
  readonly name: string;
  readonly description: string | null;
  readonly unit: string | null;
  readonly sourceLabel: string | null;
  readonly sourceUrl: string | null;
  readonly effectDirection: string | null;
  readonly model: PredictorModelMeta;
}

export function toRegionDto(region: Region): RegionDto {
  return {
    kodeBps: region.kodeBps,
    provinsi: region.provinsi,
    kabupatenKota: region.kabupatenKota,
    tipe: region.tipe,
    latitude: region.latitude,
    longitude: region.longitude,
  };
}

export function toRegionIndicatorsDto(
  indicators: RegionIndicators,
): RegionIndicatorsDto {
  const predictors: Record<string, number | null> = {};
  indicators.predictors.forEach((value: number | null, code: IndicatorCode) => {
    predictors[code] = value;
  });
  return {
    kodeBps: indicators.kodeBps,
    tahun: indicators.tahun,
    yCategory: indicators.yCategory,
    y1Prevalence: indicators.y1Prevalence,
    predictors,
  };
}

export function toRegionBoundaryDto(
  boundary: RegionBoundary,
): RegionBoundaryDto {
  return {
    kodeBps: boundary.kodeBps,
    geometry: boundary.geometry,
    simplificationTolerance: boundary.simplificationTolerance,
    source: boundary.source,
  };
}

export function toIndicatorDefinitionDto(
  def: IndicatorDefinition,
): IndicatorDefinitionDto {
  return {
    code: def.code,
    dimension: def.dimension,
    name: def.name,
    description: def.description,
    unit: def.unit,
    sourceLabel: def.sourceLabel,
    sourceUrl: def.sourceUrl,
    effectDirection: def.effectDirection,
    model: def.model,
  };
}
