import type { Child } from "@/domain/tracking/entities/child";
import type { GrowthMeasurement } from "@/domain/tracking/entities/growth-measurement";

export interface ChildDto {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly sex: "L" | "P";
  readonly birthDate: string;
  readonly birthWeightKg: number | null;
  readonly birthLengthCm: number | null;
  readonly gestationalAgeWeeks: number | null;
  readonly notes: string | null;
}

export interface GrowthMeasurementDto {
  readonly id: string;
  readonly userId: string;
  readonly childId: string;
  readonly measuredAt: string;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
  readonly measuredLying: boolean | null;
  readonly headCircumferenceCm: number | null;
  readonly muacCm: number | null;
  readonly zScores: Readonly<Record<string, number>>;
  readonly sdClass: Readonly<Record<string, string>>;
  readonly note: string | null;
}

export function toChildDto(child: Child): ChildDto {
  return {
    id: child.id,
    userId: child.userId,
    name: child.name,
    sex: child.sex,
    birthDate: child.birthDate,
    birthWeightKg: child.birthWeightKg,
    birthLengthCm: child.birthLengthCm,
    gestationalAgeWeeks: child.gestationalAgeWeeks,
    notes: child.notes,
  };
}

export function toGrowthMeasurementDto(
  measurement: GrowthMeasurement,
): GrowthMeasurementDto {
  return {
    id: measurement.id,
    userId: measurement.userId,
    childId: measurement.childId,
    measuredAt: measurement.measuredAt,
    weightKg: measurement.weightKg,
    heightCm: measurement.heightCm,
    measuredLying: measurement.measuredLying,
    headCircumferenceCm: measurement.headCircumferenceCm,
    muacCm: measurement.muacCm,
    zScores: { ...measurement.zScores } as Readonly<Record<string, number>>,
    sdClass: { ...measurement.sdClass } as Readonly<Record<string, string>>,
    note: measurement.note,
  };
}
