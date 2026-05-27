import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type {
  ChildId,
  MeasurementId,
  UserId,
} from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import type {
  GrowthMeasurement,
  SdClassMap,
  ZScoreMap,
} from "../entities/growth-measurement";

export interface NewMeasurementInput {
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
}

export interface GrowthMeasurementRepository {
  listByChild(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<readonly GrowthMeasurement[], AppError>>;
  findById(
    userId: UserId,
    measurementId: MeasurementId,
  ): Promise<Result<GrowthMeasurement | null, AppError>>;
  create(
    input: NewMeasurementInput,
  ): Promise<Result<GrowthMeasurement, AppError>>;
}
