import type { ChildId, MeasurementId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type { GrowthIndicator } from "../value-objects/growth-indicator";
import type { SdClass } from "../value-objects/sd-classification";

/**
 * Z-scores keyed by indicator. Each entry is the latest computed value at the
 * time the measurement row was last written.
 */
export type ZScoreMap = Partial<Record<GrowthIndicator, number>>;
export type SdClassMap = Partial<Record<GrowthIndicator, SdClass>>;

export class GrowthMeasurement {
  readonly id: MeasurementId;
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly measuredAt: DateOnly;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
  readonly measuredLying: boolean | null;
  readonly headCircumferenceCm: number | null;
  readonly muacCm: number | null;
  readonly zScores: ZScoreMap;
  readonly sdClass: SdClassMap;
  readonly note: string | null;

  constructor(props: {
    id: MeasurementId;
    userId: UserId;
    childId: ChildId;
    measuredAt: DateOnly;
    weightKg: number | null;
    heightCm: number | null;
    measuredLying: boolean | null;
    headCircumferenceCm: number | null;
    muacCm: number | null;
    zScores: ZScoreMap;
    sdClass: SdClassMap;
    note: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.childId = props.childId;
    this.measuredAt = props.measuredAt;
    this.weightKg = props.weightKg;
    this.heightCm = props.heightCm;
    this.measuredLying = props.measuredLying;
    this.headCircumferenceCm = props.headCircumferenceCm;
    this.muacCm = props.muacCm;
    this.zScores = props.zScores;
    this.sdClass = props.sdClass;
    this.note = props.note;
  }
}
