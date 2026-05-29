import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import type { GrowthStandardRepository } from "@/domain/tracking/ports/growth-standard-repository";
import type { Sex } from "@/domain/tracking/value-objects/sex";
import {
  computeQuickScreening,
  type IndicatorOutcome,
  type QuickScreeningLms,
} from "@/domain/tracking/services/quick-screening";

export interface ComputeQuickScreeningCommand {
  readonly sex: Sex;
  readonly ageMonths: number;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
}

export interface QuickScreeningIndicatorDto {
  readonly indicator: "BB_U" | "TB_U" | "BB_TB" | "LK_U";
  readonly zScore: number;
  readonly sdClass: string;
}

export interface QuickScreeningResultDto {
  readonly stunting: QuickScreeningIndicatorDto | null;
  readonly supporting: readonly QuickScreeningIndicatorDto[];
  readonly missingStandards: boolean;
}

const MIN_AGE_MONTHS = 0;
const MAX_AGE_MONTHS = 60;

/**
 * Resolves WHO LMS rows for the supplied inputs and runs the pure screening
 * calculator. Returns a DTO suitable for direct JSON serialisation by the
 * Route Handler.
 *
 * `missingStandards = true` when the `growth_standards` table did not contain
 * a row for any of the requested combinations; the UI should surface a
 * friendly explanation instead of pretending the screening succeeded.
 */
export class ComputeQuickScreeningUseCase {
  constructor(private readonly standards: GrowthStandardRepository) {}

  async execute(
    command: ComputeQuickScreeningCommand,
  ): Promise<Result<QuickScreeningResultDto, AppError>> {
    if (
      command.ageMonths < MIN_AGE_MONTHS ||
      command.ageMonths > MAX_AGE_MONTHS
    ) {
      return err(
        AppErrors.validation(
          `Usia di luar rentang yang didukung (0-${MAX_AGE_MONTHS} bulan).`,
        ),
      );
    }
    if (command.weightKg !== null && command.weightKg <= 0) {
      return err(AppErrors.validation("Berat badan harus lebih dari 0 kg."));
    }
    if (command.heightCm !== null && command.heightCm <= 0) {
      return err(
        AppErrors.validation("Tinggi/panjang badan harus lebih dari 0 cm."),
      );
    }
    if (command.weightKg === null && command.heightCm === null) {
      return err(
        AppErrors.validation(
          "Minimal salah satu dari berat atau tinggi badan harus diisi.",
        ),
      );
    }

    const lms: QuickScreeningLms = {
      bbU: null,
      tbU: null,
      bbTb: null,
    };

    let missingStandards = false;

    if (command.weightKg !== null) {
      const result = await this.standards.findForAge(
        "BB_U",
        command.sex,
        command.ageMonths,
      );
      if (!result.ok) return err(result.error);
      if (result.value === null) {
        missingStandards = true;
      } else {
        Object.assign(lms, { bbU: result.value });
      }
    }

    if (command.heightCm !== null) {
      const result = await this.standards.findForAge(
        "TB_U",
        command.sex,
        command.ageMonths,
      );
      if (!result.ok) return err(result.error);
      if (result.value === null) {
        missingStandards = true;
      } else {
        Object.assign(lms, { tbU: result.value });
      }
    }

    if (command.weightKg !== null && command.heightCm !== null) {
      const result = await this.standards.findForLength(
        command.sex,
        command.heightCm,
      );
      if (!result.ok) return err(result.error);
      if (result.value === null) {
        missingStandards = true;
      } else {
        Object.assign(lms, { bbTb: result.value });
      }
    }

    const screening = computeQuickScreening(
      {
        sex: command.sex,
        ageMonths: command.ageMonths,
        weightKg: command.weightKg,
        heightCm: command.heightCm,
      },
      lms,
    );

    return ok({
      stunting: screening.stunting ? toIndicatorDto(screening.stunting) : null,
      supporting: screening.supporting.map(toIndicatorDto),
      missingStandards,
    });
  }
}

function toIndicatorDto(outcome: IndicatorOutcome): QuickScreeningIndicatorDto {
  return {
    indicator: outcome.indicator,
    zScore: outcome.zScore,
    sdClass: outcome.sdClass,
  };
}
