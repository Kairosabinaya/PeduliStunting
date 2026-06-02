import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";
import type { GrowthMeasurementRepository } from "@/domain/tracking/ports/growth-measurement-repository";
import type { GrowthStandardRepository } from "@/domain/tracking/ports/growth-standard-repository";
import type {
  SdClassMap,
  ZScoreMap,
} from "@/domain/tracking/entities/growth-measurement";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import type { LmsParams } from "@/domain/tracking/value-objects/lms-params";
import { classify } from "@/domain/tracking/value-objects/sd-classification";
import { ZScoreCalculator } from "@/domain/tracking/services/z-score-calculator";
import {
  WHO_STANDARD_MAX_AGE_MONTHS,
  isAgeWithinWhoStandards,
} from "@/domain/tracking/who-standard-range";
import { toGrowthMeasurementDto, type GrowthMeasurementDto } from "../dtos";

export interface AddMeasurementCommand {
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly measuredAt: DateOnly;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
  readonly measuredLying: boolean | null;
  readonly headCircumferenceCm: number | null;
  readonly muacCm: number | null;
  readonly note: string | null;
}

/**
 * Persists a new growth measurement. All four WHO z-scores and SD classes are
 * computed inside the use case from the WHO LMS table — never hardcoded — and
 * are stored alongside the raw measurement so charts and history views can read
 * them directly without re-computing per query.
 */
export class AddMeasurementUseCase {
  private readonly calculator = new ZScoreCalculator();

  constructor(
    private readonly children: ChildRepository,
    private readonly measurements: GrowthMeasurementRepository,
    private readonly standards: GrowthStandardRepository,
  ) {}

  async execute(
    command: AddMeasurementCommand,
  ): Promise<Result<GrowthMeasurementDto, AppError>> {
    const childResult = await this.children.findById(
      command.userId,
      command.childId,
    );
    if (!childResult.ok) return err(childResult.error);
    if (childResult.value === null) {
      return err(AppErrors.notFound("Anak tidak ditemukan.", "children"));
    }
    const child = childResult.value;

    if (command.measuredAt < child.birthDate) {
      return err(
        AppErrors.validation(
          "Tanggal pengukuran tidak boleh lebih awal dari tanggal lahir.",
        ),
      );
    }

    const ageMonths = monthsBetween(child.birthDate, command.measuredAt);

    if (!isAgeWithinWhoStandards(ageMonths)) {
      return err(
        AppErrors.validation(
          `Skrining pertumbuhan WHO hanya tersedia untuk usia 0-${WHO_STANDARD_MAX_AGE_MONTHS} bulan, sehingga z-score tidak dapat dihitung untuk pengukuran ini.`,
        ),
      );
    }

    const zScores: ZScoreMap = {};
    const sdClass: SdClassMap = {};

    // BB_U weight-for-age
    if (command.weightKg !== null) {
      const computed = await this.computeAge(
        "BB_U",
        child.sex,
        ageMonths,
        command.weightKg,
      );
      if (!computed.ok) return err(computed.error);
      if (computed.value !== null) {
        zScores["BB_U"] = computed.value;
        sdClass["BB_U"] = classify("BB_U", computed.value);
      }
    }

    // TB_U length/height-for-age
    if (command.heightCm !== null) {
      const computed = await this.computeAge(
        "TB_U",
        child.sex,
        ageMonths,
        command.heightCm,
      );
      if (!computed.ok) return err(computed.error);
      if (computed.value !== null) {
        zScores["TB_U"] = computed.value;
        sdClass["TB_U"] = classify("TB_U", computed.value);
      }
    }

    // LK_U head-circumference-for-age
    if (command.headCircumferenceCm !== null) {
      const computed = await this.computeAge(
        "LK_U",
        child.sex,
        ageMonths,
        command.headCircumferenceCm,
      );
      if (!computed.ok) return err(computed.error);
      if (computed.value !== null) {
        zScores["LK_U"] = computed.value;
        sdClass["LK_U"] = classify("LK_U", computed.value);
      }
    }

    // BB_TB weight-for-length/height — needs both weight and length
    if (command.weightKg !== null && command.heightCm !== null) {
      const lmsResult = await this.standards.findForLength(
        child.sex,
        command.heightCm,
      );
      if (!lmsResult.ok) return err(lmsResult.error);
      if (lmsResult.value !== null) {
        const z = this.safeCompute(command.weightKg, lmsResult.value);
        if (z !== null) {
          zScores["BB_TB"] = z;
          sdClass["BB_TB"] = classify("BB_TB", z);
        }
      }
    }

    const persisted = await this.measurements.create({
      userId: command.userId,
      childId: command.childId,
      measuredAt: command.measuredAt,
      weightKg: command.weightKg,
      heightCm: command.heightCm,
      measuredLying: command.measuredLying,
      headCircumferenceCm: command.headCircumferenceCm,
      muacCm: command.muacCm,
      zScores,
      sdClass,
      note: command.note,
    });
    if (!persisted.ok) {
      // A unique-violation on (child_id, measured_at) means a measurement for
      // this date already exists. Replace the raw Postgres text with guidance.
      if (persisted.error.kind === "conflict") {
        return err(
          AppErrors.conflict(
            "Sudah ada pengukuran pada tanggal tersebut. Ubah lewat riwayat pengukuran atau pilih tanggal lain.",
          ),
        );
      }
      return err(persisted.error);
    }
    return ok(toGrowthMeasurementDto(persisted.value));
  }

  private async computeAge(
    indicator: Exclude<GrowthIndicator, "BB_TB">,
    sex: "L" | "P",
    ageMonths: number,
    value: number,
  ): Promise<Result<number | null, AppError>> {
    const lmsResult = await this.standards.findForAge(
      indicator,
      sex,
      ageMonths,
    );
    if (!lmsResult.ok) return err(lmsResult.error);
    if (lmsResult.value === null) return ok(null);
    return ok(this.safeCompute(value, lmsResult.value));
  }

  private safeCompute(measurement: number, params: LmsParams): number | null {
    try {
      return this.calculator.compute(measurement, params);
    } catch {
      return null;
    }
  }
}
